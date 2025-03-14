import { Page } from 'puppeteer';
import { config } from './config';

/**
 * Wait for a specified amount of time
 * @param ms Time to wait in milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Take a screenshot and save it to a file
 * @param page Puppeteer page object
 * @param filename Name of the file to save the screenshot to
 */
export const takeScreenshot = async (page: Page, filename: string): Promise<void> => {
  // Skip screenshots if disabled in config
  if (!config.enableScreenshots) {
    console.log(`Screenshots disabled, skipping screenshot for ${filename}`);
    return;
  }

  try {
    // Ensure the page has a valid viewport
    const viewport = page.viewport();
    if (!viewport || viewport.width <= 0 || viewport.height <= 0) {
      console.log(`Cannot take screenshot for ${filename}: Invalid viewport size`);
      return;
    }
    
    await page.screenshot({ path: `${config.screenshotsDir}/${filename}.png`, fullPage: true });
    console.log(`Screenshot saved to ${config.screenshotsDir}/${filename}.png`);
  } catch (error) {
    console.log(`Error taking screenshot for ${filename}: ${error}`);
  }
};

/**
 * Format a date string (YYYY-MM-DD) to a more readable format
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "June 1, 2023")
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if a selector exists on the page
 * @param page Puppeteer page object
 * @param selector CSS selector to check
 * @returns True if the selector exists, false otherwise
 */
export const selectorExists = async (page: Page, selector: string): Promise<boolean> => {
  return (await page.$(selector)) !== null;
};

/**
 * Wait for a selector to be visible and then click it
 * @param page Puppeteer page object
 * @param selector CSS selector to click
 * @param timeout Timeout in milliseconds
 */
export const waitAndClick = async (page: Page, selector: string, timeout = 30000): Promise<void> => {
  await page.waitForSelector(selector, { visible: true, timeout });
  await page.click(selector);
};

/**
 * Get text content of an element
 * @param page Puppeteer page object
 * @param selector CSS selector
 * @returns Text content of the element
 */
export const getTextContent = async (page: Page, selector: string): Promise<string | null> => {
  return page.$eval(selector, el => el.textContent);
};

/**
 * Log a message with a timestamp
 * @param message Message to log
 */
export const logWithTimestamp = (message: string): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}; 