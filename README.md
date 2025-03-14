# WeWork Desk Booking Automation

This is a TypeScript automation tool that helps you log in to WeWork, navigate to the desk booking page, and check availability for specific dates at your preferred location.

## Features

- Automated login to WeWork
- Navigation to desk booking page
- Selection of preferred location
- Checking desk availability for multiple dates
- Detailed console output of availability status

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

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

3. Create a `.env` file in the root directory with your WeWork credentials and preferences:
   ```
   # WeWork Login Credentials
   WEWORK_EMAIL=your_email@example.com
   WEWORK_PASSWORD=your_password

   # Booking Configuration
   # Format: YYYY-MM-DD
   CHECK_DATES=2023-06-01,2023-06-02,2023-06-03
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
4. For each date specified in your `.env` file:
   - Selects your preferred location
   - Navigates to the specified date
   - Checks if desks are available
   - Outputs the result to the console

## Customization

You can modify the following in your `.env` file:
- `WEWORK_EMAIL`: Your WeWork account email
- `WEWORK_PASSWORD`: Your WeWork account password
- `CHECK_DATES`: Comma-separated list of dates to check (YYYY-MM-DD format)
- `LOCATION_NAME`: Your preferred WeWork location name

## Notes

- The automation runs with `headless: false` by default, which means you'll see the browser window. You can change this to `true` in the code for production use.
- The script includes a `slowMo` option to slow down operations, which can be adjusted or removed as needed.
- The selectors used in this script (like `.location-selector`, `.calendar`, etc.) may need to be updated if WeWork changes their website structure.

## Disclaimer

This tool is for personal use only. Please respect WeWork's terms of service and use this responsibly.

## License

MIT 