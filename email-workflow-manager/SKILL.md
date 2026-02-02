# Email Workflow Manager

## Overview
Intelligent email automation and workflow management for Gmail with AI-powered categorization and auto-response capabilities.

## Metadata
- **Name**: email-workflow-manager
- **Version**: 1.0.0
- **Tags**: email, automation, productivity, gmail
- **Pricing**: €19
- **Author**: OpenClaw Community

## Description
Email Workflow Manager transforms your Gmail inbox into an intelligent, automated system. It categorizes emails, manages labels, sends auto-replies, and provides detailed analytics about your email patterns.

## Features
- **Smart Categorization**: AI-powered email categorization (Urgent, Work, Personal, Newsletter, Social, Promotional)
- **Auto-Labeling**: Automatically label emails from specific senders
- **Auto-Responder**: Context-aware automatic replies with customizable templates
- **Email Analytics**: Track email volume, top senders, response times, and trends
- **Bulk Operations**: Process hundreds of emails efficiently
- **Custom Rules**: Create your own categorization and response rules
- **CSV Export**: Export analytics data for further analysis

## Installation

```bash
cd email-workflow-manager
npm install
```

## Configuration

### 1. Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Desktop app
   - Download the credentials JSON file
5. Save the credentials as `credentials.json` in the project root

### 2. First-Time Authentication

```bash
node scripts/gmail-auth.js
```

This will open a browser for OAuth consent. After authorization, tokens are saved to `~/.email-workflow/tokens.json`.

### 3. Environment Setup

```bash
cp .env.example .env
```

Configure any custom settings in `.env`.

## Usage

### Categorize Emails

Automatically categorize and label your recent emails:

```bash
node scripts/email-manager.js categorize 100
```

This analyzes the last 100 emails and applies appropriate labels.

### Label Emails from Sender

Label all emails from a specific sender:

```bash
node scripts/email-manager.js label sender@example.com "Important Client"
```

### View Email Statistics

```bash
# Last 30 days
node scripts/email-manager.js stats 30

# Last week
node scripts/email-manager.js stats 7

# Export to CSV
node scripts/email-manager.js stats 30 --export
```

### Setup Auto-Reply

```bash
# Enable vacation responder
node scripts/email-manager.js auto-reply --template vacation --start 2026-07-01 --end 2026-07-15

# Disable auto-reply
node scripts/email-manager.js auto-reply --disable
```

### Dry Run Mode

Test categorization without making changes:

```bash
node scripts/email-manager.js categorize 50 --dry-run
```

## Email Categories

The tool automatically categorizes emails into:

- **Urgent**: Time-sensitive emails requiring immediate attention
- **Work**: Professional correspondence, meetings, projects
- **Personal**: Friends, family, personal matters
- **Newsletter**: Subscriptions, newsletters, updates
- **Social**: Social media notifications, comments
- **Promotional**: Marketing emails, offers, advertisements

## Auto-Reply Templates

Built-in templates include:

- **vacation**: "I'm currently out of office..."
- **meeting-request**: Automatic meeting booking responses
- **acknowledgment**: "Thanks, I've received your email..."
- **quick-reply**: "I'll get back to you soon..."
- **not-interested**: Polite decline for unsolicited offers

## Analytics Features

Track and analyze:

- Total emails received per period
- Top senders
- Email volume trends
- Average response time
- Category distribution
- Busiest hours/days

## Example Output

```
📧 Email Workflow Manager

Categorizing last 100 emails...

Progress: ████████████████████ 100%

Results:
  Urgent:       12 emails
  Work:         45 emails
  Personal:     8 emails
  Newsletter:   23 emails
  Social:       7 emails
  Promotional:  5 emails

✓ Successfully categorized and labeled 100 emails
✓ Created 6 labels in Gmail
```

## API Rate Limits

Gmail API quotas (per day):
- **Free tier**: 1 billion quota units
- **Read operations**: 5 units per request
- **Modify operations**: 10 units per request
- **Send operations**: 100 units per request

The tool includes rate limiting (250ms delay between operations) to stay well within limits.

## Troubleshooting

### "Authentication Error"
1. Delete `~/.email-workflow/tokens.json`
2. Run `node scripts/gmail-auth.js` again
3. Complete the OAuth flow

### "Insufficient Permissions"
- Ensure Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen configuration
- Verify scopes in credentials

### "Rate Limit Exceeded"
- The tool has built-in rate limiting
- If you hit limits, wait 24 hours or request quota increase

## Security & Privacy

- All authentication tokens stored locally in `~/.email-workflow/`
- No email content is sent to external services
- OAuth tokens are encrypted by the system
- You can revoke access anytime in Google Account settings

## Development

Run tests:
```bash
npm test
```

## Dependencies
- googleapis: Gmail API client
- axios: HTTP requests
- csv-writer: CSV export functionality

## License
MIT

## Support
For issues and feature requests, visit the OpenClaw community forums.
