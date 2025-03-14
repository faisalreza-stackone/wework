import { Page } from 'puppeteer';
import { wait, takeScreenshot, formatDate, logWithTimestamp } from './utils';
import { config } from './config';

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
 * Format a Date object to "Mar 16, 2025" format for input
 * @param date Date object
 * @returns Formatted date string in "Mar 16, 2025" format
 */
function formatDateForInput(date: Date): string {
	// Use Intl.DateTimeFormat for more elegant date formatting
	const formatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',  // "Mar"
		day: 'numeric',  // "16"
		year: 'numeric', // "2025"
	});
	
	// Get the parts of the formatted date
	const parts = formatter.formatToParts(date);
	
	// Extract month, day, and year from the parts
	const month = parts.find(part => part.type === 'month')?.value || '';
	const day = parts.find(part => part.type === 'day')?.value || '';
	const year = parts.find(part => part.type === 'year')?.value || '';
	
	// Construct the string with the exact format including the comma
	return `${month} ${day}, ${year}`;
}

/**
 * Navigate to desk booking page
 * @param page Puppeteer page object
 */
export async function navigateToBooking(page: Page): Promise<void> {
	logWithTimestamp('Navigating to desk booking page...');

	try {
		// Go to the booking page
		await page.goto(config.bookingUrl, { waitUntil: 'networkidle2' });

		// Log the current URL to help with debugging
		logWithTimestamp(`Current URL: ${page.url()}`);
		
		// Wait for the location text to appear
		await waitForLocationText(page, '10 York Rd');

		logWithTimestamp('Successfully navigated to booking page!');
	} catch (error) {
		logWithTimestamp(`Navigation error: ${error}`);
		await takeScreenshot(page, 'navigation-error');
		throw error;
	}
}

/**
 * Wait for specific location text to appear on the page
 * @param page Puppeteer page object
 * @param locationText The location text to wait for
 */
async function waitForLocationText(page: Page, locationText: string): Promise<void> {
	logWithTimestamp(`Waiting for "${locationText}" text to appear on screen...`);
	try {
		await page.waitForFunction(
			(text) => {
				return document.body.innerText.includes(text);
			},
			{ timeout: config.defaultTimeout },
			locationText
		);
		logWithTimestamp(`Successfully found "${locationText}" text on the page!`);
	} catch (error) {
		logWithTimestamp(`Warning: Could not find "${locationText}" text on the page: ${error}`);
		await takeScreenshot(page, `${locationText.toLowerCase().replace(/\s+/g, '-')}-text-not-found`);
		// Continue execution even if text is not found, as it might be on a different page
	}
}

/**
 * Check availability for a specific date
 * @param page Puppeteer page object
 * @param date Date object
 * @returns Object with availability status and desk count if available
 */
export async function checkAvailability(page: Page, date: Date): Promise<{ date: Date; isAvailable: boolean; desksCount?: number }> {
	// Format date for logging
	const dateString = formatDateToString(date);
	logWithTimestamp(`Checking availability for date: ${formatDate(dateString)}`);

	try {
		// Select date
		await selectDate(page, date);

		// Check if desks are available and get count if possible
		const { isAvailable, desksCount } = await checkIfDesksAvailable(page);

		if (isAvailable) {
			const availabilityMessage = desksCount !== undefined 
				? `✅ ${desksCount} desks available on ${formatDate(dateString)} at ${config.location}`
				: `✅ Desks are available on ${formatDate(dateString)} at ${config.location}`;
			
			logWithTimestamp(availabilityMessage);
			// Take screenshot only for available desks (useful information)
			await takeScreenshot(page, `available-desks-${dateString}`);
		} else {
			logWithTimestamp(`❌ No desks available on ${formatDate(dateString)} at ${config.location}`);
		}
		
		// Return availability information instead of sending notification directly
		return { date, isAvailable, desksCount };
	} catch (error) {
		logWithTimestamp(`Error checking availability: ${error}`);
		await takeScreenshot(page, `availability-error-${dateString}`);
		throw error;
	}
}

/**
 * Select date
 * @param page Puppeteer page object
 * @param date Date object
 */
async function selectDate(page: Page, date: Date): Promise<void> {
	// Format date for logging
	const dateString = formatDateToString(date);
	logWithTimestamp(`Selecting date: ${formatDate(dateString)}`);

	try {
		// Look for the date input field with the form-control class
		const dateInputSelector = 'yardi-control-date input.form-control';
		logWithTimestamp(`Looking for date input with selector: ${dateInputSelector}`);
		
		// Wait for the date input to be available
		await page.waitForSelector(dateInputSelector, { timeout: config.defaultTimeout });
		
		// Get the input element
		const dateInput = await page.$(dateInputSelector);
		if (!dateInput) {
			await takeScreenshot(page, 'date-input-not-found');
			throw new Error('Could not find date input field');
		}
		
		// Clear the existing value in the input field
		await page.evaluate((el) => {
			el.value = '';
		}, dateInput);
		
		// Format the date for input
		const formattedInputDate = formatDateForInput(date);
		logWithTimestamp(`Formatted date for input: ${formattedInputDate}`);
		
		// Type the date into the input field
		await dateInput.type(formattedInputDate);
		logWithTimestamp(`Entered date: ${formattedInputDate} in the input field`);
		
		// Press Enter to confirm the date
		await dateInput.press('Enter');
		logWithTimestamp('Pressed Enter to confirm date selection');
		
		// Wait a moment for the date to be processed
		await wait(1000);

		// Wait for the location text to appear
		await waitForLocationText(page, config.location);
		
		// Verify the date was selected correctly by checking the input value
		const selectedDate = await page.evaluate((el) => el.value, dateInput);
		logWithTimestamp(`Date input field now contains: ${selectedDate}`);
		
		// Take a screenshot to verify the date selection
		await takeScreenshot(page, `date-selected-${dateString}`);
		
		logWithTimestamp(`Date ${formatDate(dateString)} selected!`);
	} catch (error) {
		logWithTimestamp(`Error selecting date: ${error}`);
		await takeScreenshot(page, `date-selection-error-${dateString}`);
		throw error;
	}
}

/**
 * Check if desks are available
 * @param page Puppeteer page object
 * @returns Object with availability status and desk count if available
 */
async function checkIfDesksAvailable(page: Page): Promise<{ isAvailable: boolean; desksCount?: number }> {
	try {
		// Wait for content to load
		await wait(2000);
		
		logWithTimestamp('Checking for desk availability...');
		
		// Look for the specific format where desk availability is shown
		// First, try to find the location card with "10 York Rd"
		const locationCardSelector = '.card-title';
		const locationCards = await page.$$(locationCardSelector);
		
		// Find the card that contains "10 York Rd"
		for (const card of locationCards) {
			const cardText = await page.evaluate(el => el.textContent, card);
			if (cardText && cardText.includes('10 York Rd')) {
				logWithTimestamp(`Found location card for 10 York Rd`);
				
				// Look for the desk availability text in the same parent container
				const availabilityText = await page.evaluate(el => {
					// Navigate up to the parent container
					const container = el.closest('.d-flex.flex-column');
					if (!container) return null;
					
					// Find the element with desk availability information
					const availabilityElement = container.querySelector('.text-primary div[translate]');
					return availabilityElement ? availabilityElement.textContent : null;
				}, card);
				
				if (availabilityText) {
					logWithTimestamp(`Found availability text: "${availabilityText}"`);
					
					// Check if it contains a number of desks available
					const desksMatch = availabilityText.match(/(\d+)\s+desk/i);
					if (desksMatch) {
						const desksCount = parseInt(desksMatch[1], 10);
						logWithTimestamp(`✅ ${desksCount} desks available at 10 York Rd`);
						return { isAvailable: desksCount > 0, desksCount };
					}
				}
			}
		}
		
		// Take a screenshot to help with debugging
		await takeScreenshot(page, 'desk-availability-check');
		
		// If we've checked everything and found no information, assume no desks are available
		logWithTimestamp('Could not determine desk availability, assuming none are available');
		return { isAvailable: false };
	} catch (error) {
		logWithTimestamp(`Error checking desk availability: ${error}`);
		await takeScreenshot(page, 'availability-check-error');
		throw error;
	}
}