# WeWork Desk Booking Automation

This is a TypeScript automation tool that helps you log in to WeWork, navigate to the desk booking page, and check availability for specific dates at your preferred location. It can also send Slack notifications with availability information.

## Features

- Automated login to WeWork
- Navigation to desk booking page
- Selection of preferred location
- Checking desk availability for next Tuesday and Thursday
- Slack notifications with availability results
- Option to run on a second display (for Mac users)
- Configurable screenshot settings
- Detailed console output of availability status

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A WeWork account
- (Optional) A Slack workspace with webhook URL for notifications

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd wework-automation
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your configuration:
   ```
   # See the Configuration section below for all available options
   WEWORK_EMAIL=your_email@example.com
   WEWORK_PASSWORD=your_password
   LOCATION_NAME="Your Preferred Location"
   ```

## Usage

1. Build the TypeScript code:
   ```
   npm run build
   ```

2. Run the automation:
   ```
   npm start
   ```

   Or run in development mode:
   ```
   npm run dev
   ```

## How It Works

1. The script launches a Puppeteer browser instance
2. Logs in to WeWork using your credentials
3. Navigates to the desk booking page
4. Checks availability for the next Tuesday and Thursday:
   - Selects your preferred location
   - Navigates to each date
   - Checks if desks are available and how many
5. Sends a Slack notification with the results (if configured)
6. Outputs a summary to the console

## Configuration

All configuration is done through environment variables in the `.env` file. Here's a complete list of available options:

### Required Settings

```
# WeWork Login Credentials
WEWORK_EMAIL=your_email@example.com
WEWORK_PASSWORD=your_password

# WeWork Location
LOCATION_NAME="Your Preferred Location"
```

### Browser Settings

```
# Set to 'true' for headless mode (no browser UI)
HEADLESS=false

# Slow down operations by this many milliseconds (useful for debugging)
SLOW_MO=50
```

### Timeout Settings

```
# Default timeout for operations in milliseconds
DEFAULT_TIMEOUT=30000

# Timeout specifically for login operations
LOGIN_TIMEOUT=60000
```

### Behavior Settings

```
# Set to 'true' to logout after completing the automation
LOGOUT_AFTER_COMPLETION=false
```

### Screenshot Settings

```
# Directory to save screenshots (relative to project root)
SCREENSHOTS_DIR=./screenshots

# Set to 'false' to disable taking screenshots during automation
ENABLE_SCREENSHOTS=true
```

### Slack Integration

```
# Webhook URL for sending notifications to Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK_URL
```

### Display Settings (for Mac users)

```
# Set to 'true' to use the second display
USE_SECOND_DISPLAY=false

# Optional: Specific window position (x,y coordinates) as JSON
# WINDOW_POSITION={"x":2000,"y":100}
```

## Slack Notifications

When Slack integration is configured, the automation will send a single message containing:
- Availability status for each date checked
- Number of available desks (when known)
- A link to the WeWork login page to quickly book a desk

To set up Slack notifications:
1. Create a Slack App in your workspace
2. Enable Incoming Webhooks
3. Create a webhook for the channel where you want to receive notifications
4. Add the webhook URL to your `.env` file

## Display Settings

For Mac users who want to run the automation on a second display:
1. Set `USE_SECOND_DISPLAY=true` in your `.env` file
2. Optionally, specify the exact position with `WINDOW_POSITION={"x":2000,"y":100}`
3. Adjust the x,y coordinates based on your specific display arrangement

## Notes

- The automation is configured to check the next Tuesday and Thursday by default
- Screenshots are saved to help with debugging and verification
- You can disable screenshots to save disk space by setting `ENABLE_SCREENSHOTS=false`
- The browser window position defaults to coordinates that work for most second displays (x:2000, y:100)

## Disclaimer

This tool is for personal use only. Please respect WeWork's terms of service and use this responsibly.

## License

MIT 