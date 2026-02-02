#!/usr/bin/env node

import { getGmailClient } from './gmail-auth.js';
import { batchCategorizeEmails, ensureLabel, applyLabel, categorizeEmail } from './categorizer.js';
import { setupVacationResponder, disableAutoReply, getVacationSettings } from './auto-responder.js';
import { getEmailStats, exportStatsToCSV, calculateResponseTimes } from './analytics.js';
import { config } from 'dotenv';

config();

/**
 * Display help information
 */
function showHelp() {
  console.log(`
📧 Email Workflow Manager - CLI

Usage:
  node scripts/email-manager.js <command> [options]

Commands:
  categorize <count>           Categorize last N emails
  label <sender> <label>       Label all emails from sender
  stats <days>                 Show email statistics
  auto-reply <action>          Manage auto-reply settings
  help                         Show this help

Options:
  --dry-run                    Preview changes without applying
  --export                     Export data to CSV (for stats)

Examples:
  node scripts/email-manager.js categorize 100
  node scripts/email-manager.js categorize 50 --dry-run
  node scripts/email-manager.js label boss@company.com "Important"
  node scripts/email-manager.js stats 30
  node scripts/email-manager.js stats 7 --export
  node scripts/email-manager.js auto-reply --disable

Auto-Reply Options:
  --template <name>            Template to use (vacation, quick_reply, etc.)
  --start <date>              Start date (YYYY-MM-DD)
  --end <date>                End date (YYYY-MM-DD)
  --disable                   Disable auto-reply
  --status                    Show current auto-reply status
`);
}

/**
 * Categorize emails command
 */
async function categorizeCommand(gmail, count, options = {}) {
  console.log(`\n📧 Email Workflow Manager\n`);
  console.log(`Categorizing last ${count} emails${options.dryRun ? ' (DRY RUN)' : ''}...\n`);

  try {
    // Fetch recent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Math.min(count, 500),
      labelIds: ['INBOX']
    });

    const messageIds = response.data.messages || [];

    if (messageIds.length === 0) {
      console.log('No emails found to categorize.\n');
      return;
    }

    console.log(`Fetching ${messageIds.length} emails...`);

    // Fetch full message details
    const emails = [];
    for (const msg of messageIds) {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });
      emails.push(message.data);
      await delay(100); // Rate limiting
    }

    console.log('Analyzing and categorizing...\n');

    // Categorize emails
    const results = await batchCategorizeEmails(gmail, emails, options.dryRun);

    // Display results
    console.log('Results:');
    for (const [category, count] of Object.entries(results.byCategory)) {
      console.log(`  ${category.padEnd(15)} ${count} emails`);
    }

    console.log(`\n✓ Successfully ${options.dryRun ? 'analyzed' : 'categorized and labeled'} ${results.categorized} emails`);

    if (!options.dryRun) {
      console.log(`✓ Created/updated ${Object.keys(results.byCategory).length} labels in Gmail`);
    }

    if (results.errors.length > 0) {
      console.log(`\n⚠ ${results.errors.length} errors occurred`);
    }

    console.log('');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Label emails from sender command
 */
async function labelCommand(gmail, sender, labelName) {
  console.log(`\n📧 Email Workflow Manager\n`);
  console.log(`Labeling all emails from ${sender} with "${labelName}"...\n`);

  try {
    // Search for emails from sender
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${sender}`,
      maxResults: 500
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      console.log(`No emails found from ${sender}\n`);
      return;
    }

    console.log(`Found ${messages.length} emails`);

    // Ensure label exists
    const labelId = await ensureLabel(gmail, labelName);

    // Apply label to all messages
    let labeled = 0;
    for (const msg of messages) {
      try {
        await applyLabel(gmail, msg.id, labelId);
        labeled++;
        await delay(250); // Rate limiting
      } catch (error) {
        console.warn(`Failed to label message ${msg.id}: ${error.message}`);
      }
    }

    console.log(`\n✓ Successfully labeled ${labeled} emails\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Stats command
 */
async function statsCommand(gmail, days, options = {}) {
  console.log(`\n📧 Email Workflow Manager - Analytics\n`);
  console.log(`Analyzing emails from the last ${days} days...\n`);

  try {
    const stats = await getEmailStats(gmail, days);

    console.log('━'.repeat(60));
    console.log(`Period: Last ${days} days`);
    console.log(`Total Emails: ${stats.totalEmails}`);
    console.log(`Average: ${stats.avgEmailsPerDay} emails/day`);
    console.log(`Busiest Hour: ${stats.busiestHour}`);
    console.log('━'.repeat(60));

    console.log('\n📊 Top Senders:');
    stats.topSenders.slice(0, 10).forEach((sender, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${sender.email.padEnd(40)} ${sender.count} emails`);
    });

    console.log('\n📈 Daily Volume (last 7 days):');
    stats.dailyVolume.slice(-7).forEach(day => {
      const bar = '█'.repeat(Math.ceil(day.count / 5));
      console.log(`  ${day.date}  ${bar} ${day.count}`);
    });

    // Calculate response times
    console.log('\n⏱️  Response Time Analysis:');
    const responseTimes = await calculateResponseTimes(gmail, Math.min(days, 7));
    console.log(`  Average: ${responseTimes.avgResponseTime}`);
    console.log(`  Median:  ${responseTimes.medianResponseTime}`);
    if (responseTimes.samplesAnalyzed) {
      console.log(`  (Based on ${responseTimes.samplesAnalyzed} samples)`);
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // Export if requested
    if (options.export) {
      console.log('Exporting to CSV...');
      const result = await exportStatsToCSV(stats, `email-stats-${days}days.csv`);
      console.log(`✓ Exported to:`);
      result.files.forEach(file => console.log(`  ${file}`));
      console.log('');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Auto-reply command
 */
async function autoReplyCommand(gmail, options = {}) {
  console.log(`\n📧 Email Workflow Manager - Auto-Reply\n`);

  try {
    if (options.status) {
      // Show current status
      const settings = await getVacationSettings(gmail);
      console.log('Current auto-reply status:');
      console.log(`  Enabled: ${settings.enableAutoReply ? 'Yes' : 'No'}`);
      if (settings.enableAutoReply) {
        console.log(`  Subject: ${settings.responseSubject || 'N/A'}`);
        if (settings.startTime) {
          console.log(`  Start: ${new Date(parseInt(settings.startTime)).toLocaleDateString()}`);
        }
        if (settings.endTime) {
          console.log(`  End: ${new Date(parseInt(settings.endTime)).toLocaleDateString()}`);
        }
      }
      console.log('');
      return;
    }

    if (options.disable) {
      // Disable auto-reply
      await disableAutoReply(gmail);
      console.log('✓ Auto-reply disabled\n');
      return;
    }

    if (options.template === 'vacation' && options.start && options.end) {
      // Setup vacation responder
      const result = await setupVacationResponder(gmail, {
        startDate: options.start,
        endDate: options.end,
        backupContact: options.backup || 'your team',
        senderName: options.name || 'The Team'
      });
      console.log(`✓ ${result.message}\n`);
      return;
    }

    console.log('⚠  Invalid auto-reply options. Use --help for examples.\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse CLI arguments
 */
function parseArgs(args) {
  const options = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('help') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const { positional, options } = parseArgs(args);
  const command = positional[0];

  try {
    // Get authenticated Gmail client
    const gmail = await getGmailClient();

    switch (command) {
      case 'categorize':
        const count = parseInt(positional[1]) || 50;
        await categorizeCommand(gmail, count, { dryRun: options['dry-run'] });
        break;

      case 'label':
        const sender = positional[1];
        const labelName = positional[2];
        if (!sender || !labelName) {
          console.error('❌ Usage: label <sender> <label-name>\n');
          process.exit(1);
        }
        await labelCommand(gmail, sender, labelName);
        break;

      case 'stats':
        const days = parseInt(positional[1]) || 30;
        await statsCommand(gmail, days, { export: options.export });
        break;

      case 'auto-reply':
        await autoReplyCommand(gmail, options);
        break;

      default:
        console.error(`❌ Unknown command: ${command}\n`);
        console.error('Use --help to see available commands\n');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
