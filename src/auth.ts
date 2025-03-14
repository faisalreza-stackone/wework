import { Page } from 'puppeteer';
import { wait, takeScreenshot, logWithTimestamp } from './utils';
import { config } from './config';

/**
 * Login to WeWork
 * @param page Puppeteer page object
 */
export async function login(page: Page): Promise<void> {
	logWithTimestamp('Logging in to WeWork...');
	
	try {
        logWithTimestamp('Going directly to login URL...');
        await page.goto(config.loginUrl, { waitUntil: 'networkidle2' });
		await wait(3000);

		// Click member log in button
		logWithTimestamp('Clicking member log in button...');
		const loginButtonSelector = 'button.btn-login';
		
		if (!await clickElement(page, loginButtonSelector, 'member log in button')) {
			throw new Error('Could not find member log in button');
		}
		
		await wait(2000);
		
		// Enter email
		logWithTimestamp('Entering email...');
		const emailSelector = 'input[type="email"]';
		
		if (!await fillInput(page, emailSelector, config.email, 'email field')) {
			throw new Error('Could not find email input field');
		}

        // Enter password
		logWithTimestamp('Entering password...');
		const passwordSelector = 'input[type="password"]';
		
		if (!await fillInput(page, passwordSelector, config.password, 'password field')) {
			throw new Error('Could not find password input field');
		}
		
		// Click login button
		logWithTimestamp('Clicking final login button...');
		const loginButtonSelector2 = 'button[type="submit"]';
		
		if (!await clickElement(page, loginButtonSelector2, 'login button')) {
			throw new Error('Could not find login button');
		}
		
		// Wait for login to complete
		await wait(5000);
		
		logWithTimestamp(`Current URL after login: ${page.url()}`);
		logWithTimestamp('Login process completed!');
	} catch (error) {
		logWithTimestamp(`Login error: ${error}`);
		await takeScreenshot(page, 'login-error');
		throw error;
	}
}

/**
 * Helper function to click an element using a selector
 * @param page Puppeteer page object
 * @param selector CSS selector for the element
 * @param elementName Name of the element for logging
 * @returns True if element was clicked, false otherwise
 */
async function clickElement(page: Page, selector: string, elementName: string): Promise<boolean> {
	const elements = await page.$$(selector);
	logWithTimestamp(`Found ${elements.length} ${elementName}s with selector: ${selector}`);
	
	if (elements.length > 0) {
		try {
			await Promise.all([
				page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
				elements[0].click()
			]);
			
			logWithTimestamp(`Clicked ${elementName} with selector: ${selector}`);
			return true;
		} catch (error) {
			logWithTimestamp(`Error clicking ${elementName}: ${error}`);
			await takeScreenshot(page, `error-clicking-${elementName.replace(/\s+/g, '-')}`);
			return false;
		}
	}
	
	return false;
}

/**
 * Helper function to fill an input field
 * @param page Puppeteer page object
 * @param selector CSS selector for the input
 * @param value Value to enter in the input
 * @param fieldName Name of the field for logging
 * @returns True if input was filled, false otherwise
 */
async function fillInput(page: Page, selector: string, value: string, fieldName: string): Promise<boolean> {
	const inputs = await page.$$(selector);
	logWithTimestamp(`Found ${inputs.length} ${fieldName}s with selector: ${selector}`);
	
	if (inputs.length > 0) {
		try {
			await inputs[0].type(value);
			logWithTimestamp(`Entered value in ${fieldName} with selector: ${selector}`);
			return true;
		} catch (error) {
			logWithTimestamp(`Error filling ${fieldName}: ${error}`);
			await takeScreenshot(page, `error-filling-${fieldName.replace(/\s+/g, '-')}`);
			return false;
		}
	}
	
	return false;
}

/**
 * Check if the user is logged in
 * @param page Puppeteer page object
 * @returns True if the user is logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
	try {
		// Check for an element that indicates the user is logged in
		const loggedInSelector = '.user-menu';
		const elements = await page.$$(loggedInSelector);
		
		if (elements.length > 0) {
			logWithTimestamp(`Found logged in indicator with selector: ${loggedInSelector}`);
			return true;
		}
		
		// Check URL for indicators of being logged in
		const currentUrl = page.url();
		if (
			currentUrl.includes('/dashboard') ||
			currentUrl.includes('/account') ||
			currentUrl.includes('/profile') ||
			currentUrl.includes('/workspace')
		) {
			logWithTimestamp(`URL indicates user is logged in: ${currentUrl}`);
			return true;
		}
		
		// Take screenshot if login verification fails
		await takeScreenshot(page, 'login-verification-failed');
		return false;
	} catch (error) {
		logWithTimestamp(`Error checking login status: ${error}`);
		await takeScreenshot(page, 'login-status-error');
		return false;
	}
}

/**
 * Logout from WeWork
 * @param page Puppeteer page object
 */
export async function logout(page: Page): Promise<void> {
	logWithTimestamp('Logging out from WeWork...');
	
	try {
		// Try direct logout button first
		const logoutSelector = 'a:contains("Logout")';
		const elements = await page.$$(logoutSelector);
		
		if (elements.length > 0) {
			await elements[0].click();
			logWithTimestamp(`Clicked logout element with selector: ${logoutSelector}`);
			
			// Wait for logout to complete
			await wait(3000);
			return;
		}
		
		// If no direct logout button, try clicking user menu first
		const menuSelector = '.user-menu';
		const menuElements = await page.$$(menuSelector);
		
		if (menuElements.length > 0) {
			await menuElements[0].click();
			logWithTimestamp(`Clicked user menu with selector: ${menuSelector}`);
			
			// Wait for menu to appear
			await wait(1000);
			
			// Now look for logout option in the menu
			const menuLogoutSelector = 'a:contains("Logout")';
			const logoutElements = await page.$$(menuLogoutSelector);
			
			if (logoutElements.length > 0) {
				await logoutElements[0].click();
				logWithTimestamp(`Clicked logout option with selector: ${menuLogoutSelector}`);
				
				// Wait for logout to complete
				await wait(3000);
				return;
			}
		}
		
		logWithTimestamp('Could not find logout button or link');
		await takeScreenshot(page, 'logout-failed');
	} catch (error) {
		logWithTimestamp(`Error during logout: ${error}`);
		await takeScreenshot(page, 'logout-error');
		throw error;
	}
} 