import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

/**
 * Get email statistics for a period
 */
export async function getEmailStats(gmail, daysBack = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const query = `after:${Math.floor(startDate.getTime() / 1000)}`;

    // Get list of messages
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 500
    });

    const messages = messagesResponse.data.messages || [];

    if (messages.length === 0) {
      return {
        period: daysBack,
        totalEmails: 0,
        topSenders: [],
        dailyVolume: [],
        categoryBreakdown: {}
      };
    }

    // Fetch full message details
    const emailDetails = [];
    for (const msg of messages.slice(0, 100)) {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Date', 'Subject']
        });
        emailDetails.push(detail.data);
        await delay(100); // Rate limiting
      } catch (error) {
        console.warn(`Failed to fetch message ${msg.id}: ${error.message}`);
      }
    }

    // Analyze data
    const stats = analyzeEmails(emailDetails, daysBack);

    return stats;
  } catch (error) {
    throw new Error(`Failed to get email stats: ${error.message}`);
  }
}

/**
 * Analyze email data
 */
function analyzeEmails(emails, daysBack) {
  const senderCounts = {};
  const dailyVolume = {};
  const hourlyVolume = Array(24).fill(0);

  emails.forEach(email => {
    const headers = email.payload?.headers || [];

    // Get sender
    const fromHeader = headers.find(h => h.name === 'From');
    if (fromHeader) {
      const sender = extractEmail(fromHeader.value);
      senderCounts[sender] = (senderCounts[sender] || 0) + 1;
    }

    // Get date
    const dateHeader = headers.find(h => h.name === 'Date');
    if (dateHeader) {
      const date = new Date(dateHeader.value);
      const dateKey = date.toISOString().split('T')[0];
      dailyVolume[dateKey] = (dailyVolume[dateKey] || 0) + 1;

      // Track hourly volume
      const hour = date.getHours();
      hourlyVolume[hour]++;
    }
  });

  // Sort top senders
  const topSenders = Object.entries(senderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([email, count]) => ({ email, count }));

  // Convert daily volume to array
  const dailyVolumeArray = Object.entries(dailyVolume)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // Find busiest hour
  const busiestHour = hourlyVolume.indexOf(Math.max(...hourlyVolume));

  return {
    period: daysBack,
    totalEmails: emails.length,
    topSenders,
    dailyVolume: dailyVolumeArray,
    avgEmailsPerDay: (emails.length / daysBack).toFixed(1),
    busiestHour: `${busiestHour}:00 - ${busiestHour + 1}:00`,
    hourlyDistribution: hourlyVolume
  };
}

/**
 * Extract email address from "Name <email@domain.com>" format
 */
function extractEmail(fromString) {
  const match = fromString.match(/<(.+?)>/);
  return match ? match[1] : fromString;
}

/**
 * Export statistics to CSV
 */
export async function exportStatsToCSV(stats, filename = 'email-stats.csv') {
  try {
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filepath = path.join(exportDir, filename);

    // Create CSV for top senders
    const sendersPath = filepath.replace('.csv', '-senders.csv');
    const sendersCsvWriter = createObjectCsvWriter({
      path: sendersPath,
      header: [
        { id: 'email', title: 'Email' },
        { id: 'count', title: 'Count' }
      ]
    });
    await sendersCsvWriter.writeRecords(stats.topSenders);

    // Create CSV for daily volume
    const dailyPath = filepath.replace('.csv', '-daily.csv');
    const dailyCsvWriter = createObjectCsvWriter({
      path: dailyPath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'count', title: 'Emails' }
      ]
    });
    await dailyCsvWriter.writeRecords(stats.dailyVolume);

    return {
      success: true,
      files: [sendersPath, dailyPath]
    };
  } catch (error) {
    throw new Error(`Failed to export to CSV: ${error.message}`);
  }
}

/**
 * Calculate response time metrics
 */
export async function calculateResponseTimes(gmail, daysBack = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get threads with responses
    const query = `after:${Math.floor(startDate.getTime() / 1000)} in:sent`;

    const threadsResponse = await gmail.users.threads.list({
      userId: 'me',
      q: query,
      maxResults: 50
    });

    const threads = threadsResponse.data.threads || [];
    const responseTimes = [];

    for (const thread of threads) {
      try {
        const threadDetail = await gmail.users.threads.get({
          userId: 'me',
          id: thread.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Date']
        });

        const messages = threadDetail.data.messages || [];
        if (messages.length < 2) continue;

        // Find first received and first sent
        const receivedMsg = messages.find(m => !isSentByMe(m));
        const sentMsg = messages.find(m => isSentByMe(m));

        if (receivedMsg && sentMsg) {
          const receivedDate = getMessageDate(receivedMsg);
          const sentDate = getMessageDate(sentMsg);

          if (sentDate > receivedDate) {
            const responseTime = (sentDate - receivedDate) / 1000 / 60; // minutes
            responseTimes.push(responseTime);
          }
        }

        await delay(100);
      } catch (error) {
        console.warn(`Failed to process thread: ${error.message}`);
      }
    }

    if (responseTimes.length === 0) {
      return { avgResponseTime: 'N/A', medianResponseTime: 'N/A' };
    }

    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const sorted = responseTimes.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      avgResponseTime: formatTime(avg),
      medianResponseTime: formatTime(median),
      samplesAnalyzed: responseTimes.length
    };
  } catch (error) {
    throw new Error(`Failed to calculate response times: ${error.message}`);
  }
}

/**
 * Check if message was sent by user
 */
function isSentByMe(message) {
  const labelIds = message.labelIds || [];
  return labelIds.includes('SENT');
}

/**
 * Get message date
 */
function getMessageDate(message) {
  const headers = message.payload?.headers || [];
  const dateHeader = headers.find(h => h.name === 'Date');
  return dateHeader ? new Date(dateHeader.value) : new Date();
}

/**
 * Format time in human-readable format
 */
function formatTime(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
