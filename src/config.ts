import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Add slackWebhookUrl to the config interface and default config
export interface Config {
    email: string;
    password: string;
    location: string;
    baseUrl: string;
    loginUrl: string;
    bookingUrl: string;
    screenshotsDir: string;
    headless: boolean;
    slowMo: number;
    defaultTimeout: number;
    loginTimeout: number;
    logoutAfterCompletion: boolean;
    slackWebhookUrl?: string; // Optional Slack webhook URL for notifications
    enableScreenshots: boolean; // Whether to take screenshots during automation
    windowPosition?: { x: number; y: number }; // Position of the browser window
    useSecondDisplay: boolean; // Whether to use the second display
}

// Configuration object
export const config: Config = {
  // Credentials
  email: process.env.WEWORK_EMAIL || '',
  password: process.env.WEWORK_PASSWORD || '',

  // WeWork location
  location: process.env.WEWORK_LOCATION || "10 York Rd",
  
  // URLs
  baseUrl: 'https://www.wework.com',
  loginUrl: 'https://members.wework.com/workplaceone/content2/login/welcome',
  bookingUrl: 'https://members.wework.com/workplaceone/content2/bookings/desks',
  
  // Directories
  screenshotsDir: process.env.SCREENSHOTS_DIR || './screenshots',
  
  // Browser settings
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  
  // Timeouts
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
  loginTimeout: parseInt(process.env.LOGIN_TIMEOUT || '60000', 10),
  
  // Behavior settings
  logoutAfterCompletion: process.env.LOGOUT_AFTER_COMPLETION !== 'false',
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '', // Slack webhook URL from environment variable
  enableScreenshots: process.env.ENABLE_SCREENSHOTS !== 'false', // Enable screenshots by default
  
  // Display settings
  windowPosition: process.env.WINDOW_POSITION ? 
    JSON.parse(process.env.WINDOW_POSITION) : 
    undefined,
  useSecondDisplay: process.env.USE_SECOND_DISPLAY === 'true',
};

// Validate configuration
export const validateConfig = (): void => {
  if (!config.email || !config.password) {
    throw new Error('WEWORK_EMAIL and WEWORK_PASSWORD must be set in .env file');
  }

  if (!config.location) {
    throw new Error('LOCATION_NAME must be set in .env file');
  }
}; 