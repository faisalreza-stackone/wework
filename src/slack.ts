import axios from 'axios';
import { formatDate, logWithTimestamp } from './utils';
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
 * Send a combined desk availability notification for multiple dates
 * @param results Array of availability results
 * @param locationName Location name
 */
export async function sendCombinedSlackNotification(
    results: Array<{ date: Date; isAvailable: boolean; desksCount?: number }>,
    locationName: string = config.location
): Promise<void> {
    if (!config.slackWebhookUrl) {
        logWithTimestamp('Slack webhook URL not configured, skipping notification');
        return;
    }

    if (results.length === 0) {
        logWithTimestamp('No availability results to send, skipping notification');
        return;
    }

    try {
        logWithTimestamp('Sending combined desk availability notification to Slack...');
        
        // Create attachments for each date
        const attachments = results.map(result => {
            const dateString = formatDateToString(result.date);
            const formattedDate = formatDate(dateString);
            
            // Create the message text
            let messageText = '';
            let color = '';
            
            if (result.isAvailable) {
                color = 'good'; // green
                if (result.desksCount !== undefined) {
                    messageText = `✅ *${result.desksCount} desks available* on ${formattedDate}`;
                } else {
                    messageText = `✅ *Desks are available* on ${formattedDate}`;
                }
            } else {
                color = 'danger'; // red
                messageText = `❌ *No desks available* on ${formattedDate}`;
            }
            
            return {
                color: color,
                text: messageText,
                fields: [
                    {
                        title: 'Date',
                        value: formattedDate,
                        short: true
                    }
                ]
            };
        });
        
        // Add a final attachment with the Book Desk button
        attachments.push({
            color: "#3AA3E3",
            callback_id: "book_desk_action",
            actions: [
                {
                    type: "button",
                    text: "Book Desk",
                    url: config.loginUrl,
                    style: "primary"
                }
            ]
        });
        
        // Create the Slack message payload
        const payload = {
            text: `*WeWork Desk Availability Update for ${locationName}*`,
            attachments: attachments,
            footer: 'WeWork Desk Booking Automation',
            ts: Math.floor(Date.now() / 1000)
        };
        
        // Send the message to Slack
        const response = await axios.post(config.slackWebhookUrl, payload);
        
        if (response.status === 200) {
            logWithTimestamp('Successfully sent combined notification to Slack');
        } else {
            logWithTimestamp(`Warning: Slack notification returned status ${response.status}`);
        }
    } catch (error) {
        logWithTimestamp(`Error sending combined Slack notification: ${error}`);
        // Don't throw the error, just log it - we don't want to interrupt the flow
    }
}

/**
 * Send desk availability information to Slack
 * @param date Date object
 * @param isAvailable Whether desks are available
 * @param desksCount Number of available desks (if known)
 * @param locationName Location name
 */
export async function sendSlackNotification(date: Date, isAvailable: boolean, desksCount?: number, locationName: string = config.location): Promise<void> {
    if (!config.slackWebhookUrl) {
        logWithTimestamp('Slack webhook URL not configured, skipping notification');
        return;
    }

    try {
        logWithTimestamp('Sending desk availability notification to Slack...');
        
        // Format the date for display
        const dateString = formatDateToString(date);
        const formattedDate = formatDate(dateString);
        
        // Create the message text
        let messageText = '';
        let color = '';
        
        if (isAvailable) {
            color = 'good'; // green
            if (desksCount !== undefined) {
                messageText = `✅ *${desksCount} desks available* on ${formattedDate} at ${locationName}`;
            } else {
                messageText = `✅ *Desks are available* on ${formattedDate} at ${locationName}`;
            }
        } else {
            color = 'danger'; // red
            messageText = `❌ *No desks available* on ${formattedDate} at ${locationName}`;
        }
        
        // Create the Slack message payload
        const payload = {
            attachments: [
                {
                    color: color,
                    pretext: 'WeWork Desk Availability Update',
                    text: messageText,
                    fields: [
                        {
                            title: 'Date',
                            value: formattedDate,
                            short: true
                        },
                        {
                            title: 'Location',
                            value: locationName,
                            short: true
                        }
                    ],
                    footer: 'WeWork Desk Booking Automation',
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        };
        
        // Send the message to Slack
        const response = await axios.post(config.slackWebhookUrl, payload);
        
        if (response.status === 200) {
            logWithTimestamp('Successfully sent notification to Slack');
        } else {
            logWithTimestamp(`Warning: Slack notification returned status ${response.status}`);
        }
    } catch (error) {
        logWithTimestamp(`Error sending Slack notification: ${error}`);
        // Don't throw the error, just log it - we don't want to interrupt the flow
    }
} 