import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import { takeScreenshot, logWithTimestamp } from './utils';
import { config, validateConfig } from './config';
import { login, isLoggedIn, logout } from './auth';
import { navigateToBooking, checkAvailability } from './booking';
import { sendSlackNotification, sendCombinedSlackNotification } from './slack';

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(config.screenshotsDir)) {
	fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

/**
 * Format a Date object to YYYY-MM-DD string format
 * @param date Date object
 * @returns Formatted date string in YYYY-MM-DD format
 */
function formatDateToString(date: Date): string {
	// Use ISO string and extract the date part (YYYY-MM-DD)
	return date.toISOString().split('T')[0];
}

/**
 * Get the next Tuesday and Thursday dates from the current date
 * @returns Array of Date objects for the next Tuesday and Thursday
 */
export function getNextTuesdayAndThursday(): Date[] {
	const today = new Date();
	const dates: Date[] = [];
	
	// Find next Tuesday (day 2)
	const nextTuesday = new Date(today);
	const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
	// If today is Tuesday, get next Tuesday (add 7 days)
	nextTuesday.setDate(today.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
	
	// Find next Thursday (day 4)
	const nextThursday = new Date(today);
	const daysUntilThursday = (4 - today.getDay() + 7) % 7;
	// If today is Thursday, get next Thursday (add 7 days)
	nextThursday.setDate(today.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday));
	
	dates.push(nextTuesday);
	dates.push(nextThursday);
	
	logWithTimestamp(`Generated dates for next Tuesday (${formatDateToString(nextTuesday)}) and Thursday (${formatDateToString(nextThursday)})`);
	
	return dates;
}

// Main function
async function main() {
	try {
		// Validate configuration
		validateConfig();
		
		logWithTimestamp('Starting WeWork desk booking automation...');
		
		const browser = await launchBrowser();
		const page = await browser.newPage();
		
		try {
			// Set viewport size
			await page.setViewport({ width: 1280, height: 800 });
			
			// Login to WeWork
			await login(page);
			
			// Check if login was successful
			const loggedIn = await isLoggedIn(page);
			if (!loggedIn) {
				throw new Error('Login failed. Could not verify logged in status.');
			}
			
			logWithTimestamp('Successfully logged in and verified!');
			
			// Navigate to desk booking
			await navigateToBooking(page);
			
			// Check availability for each date and collect results
			const nextDates = getNextTuesdayAndThursday();
			const availabilityResults = [];
			
			for (const date of nextDates) {
				// Check availability and get results
				const result = await checkAvailability(page, date);
				availabilityResults.push(result);
				
				// Wait a bit between checks to avoid rate limiting
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
			
			// Send a single combined Slack notification with all results
			await sendCombinedSlackNotification(availabilityResults);
			
			// Log a summary of availability
			logWithTimestamp('Availability summary:');
			for (const result of availabilityResults) {
				const dateStr = result.date.toISOString().split('T')[0];
				const status = result.isAvailable 
					? `✅ Available (${result.desksCount || 'unknown'} desks)` 
					: '❌ Not available';
				logWithTimestamp(`${dateStr}: ${status}`);
			}
			
			// Logout if specified in config
			if (config.logoutAfterCompletion) {
				await logout(page);
			}
			
			logWithTimestamp('Automation completed successfully!');
		} catch (error) {
			console.error('An error occurred during automation:', error);
			await takeScreenshot(page, 'error');
		} finally {
			await browser.close();
		}
	} catch (error: any) {
		console.error('Configuration error:', error.message);
		process.exit(1);
	}
}

// Launch browser
async function launchBrowser(): Promise<Browser> {
	// Define browser arguments
	const args = [
		'--start-maximized',
		'--window-size=1280,800'
	];
	
	// Add position arguments if using second display
	if (config.useSecondDisplay) {
		logWithTimestamp('Configuring browser to use second display...');
		
		// If specific window position is provided, use it
		if (config.windowPosition) {
			args.push(`--window-position=${config.windowPosition.x},${config.windowPosition.y}`);
			logWithTimestamp(`Setting window position to x:${config.windowPosition.x}, y:${config.windowPosition.y}`);
		} else {
			// Default position for second display on Mac (adjust as needed)
			// This assumes the second display is to the right of the main display
			args.push('--window-position=2000,100');
			logWithTimestamp('Using default second display position (x:2000, y:100)');
		}
	}
	
	return puppeteer.launch({
		headless: config.headless,
		defaultViewport: {
			width: 1280,
			height: 1024
		},
		args: args,
		slowMo: config.slowMo,
	});
}

// Run the main function
main().catch(error => {
	console.error('Unhandled error:', error);
	process.exit(1);
}); 