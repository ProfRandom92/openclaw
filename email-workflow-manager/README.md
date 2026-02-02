# Email Workflow Manager

Intelligent email automation and workflow management for Gmail with AI-powered categorization and auto-response capabilities.

## Features

- **Smart Email Categorization**: Automatically categorize emails into Urgent, Work, Personal, Newsletter, Social, and Promotional
- **Auto-Labeling**: Bulk label emails from specific senders
- **Auto-Responder**: Set up vacation responders and context-aware automatic replies
- **Email Analytics**: Track email volume, top senders, response times, and trends
- **CSV Export**: Export analytics data for further analysis
- **Dry Run Mode**: Preview changes before applying them
- **Batch Operations**: Process hundreds of emails efficiently

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up Gmail API credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Gmail API
   - Create OAuth 2.0 credentials (Desktop app)
   - Download and save as `credentials.json` in the project root

3. Authenticate:

```bash
npm run auth
```

This opens a browser for OAuth consent. Tokens are saved to `~/.email-workflow/tokens.json`.

## Usage

### Categorize Emails

Automatically categorize and label recent emails:

```bash
# Categorize last 100 emails
node scripts/email-manager.js categorize 100

# Preview without making changes
node scripts/email-manager.js categorize 50 --dry-run
```

### Label Emails from Sender

Apply a label to all emails from a specific sender:

```bash
node scripts/email-manager.js label boss@company.com "Important Client"
node scripts/email-manager.js label newsletter@example.com "Newsletters"
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

### Manage Auto-Reply

```bash
# Check current status
node scripts/email-manager.js auto-reply --status

# Enable vacation responder
node scripts/email-manager.js auto-reply --template vacation --start 2026-07-01 --end 2026-07-15

# Disable auto-reply
node scripts/email-manager.js auto-reply --disable
```

## Email Categories

Emails are automatically categorized into:

- **Urgent**: Time-sensitive emails requiring immediate attention
- **Work**: Professional correspondence, meetings, projects
- **Personal**: Friends, family, personal matters
- **Newsletter**: Subscriptions, newsletters, updates
- **Social**: Social media notifications
- **Promotional**: Marketing emails, offers, advertisements

## Configuration

### Custom Categories

Edit `config/categories.json` to customize categorization rules:

```json
{
  "categories": {
    "Custom Category": {
      "keywords": ["keyword1", "keyword2"],
      "senderPatterns": ["@domain.com"],
      "subjectPatterns": ["pattern"],
      "priority": 1
    }
  }
}
```

### Custom Templates

Edit `config/templates.json` to create custom auto-reply templates:

```json
{
  "templates": {
    "my_template": {
      "subject": "Re: {original_subject}",
      "body": "Your custom message here",
      "variables": ["original_subject", "sender_name"]
    }
  }
}
```

## Analytics Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Period: Last 30 days
Total Emails: 342
Average: 11.4 emails/day
Busiest Hour: 10:00 - 11:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Top Senders:
   1. boss@company.com                           45 emails
   2. team@startup.io                            32 emails
   3. newsletter@techcrunch.com                  28 emails
   4. notifications@github.com                   25 emails
   5. family@gmail.com                           18 emails

📈 Daily Volume (last 7 days):
  2026-01-26  ███████ 12
  2026-01-27  █████ 9
  2026-01-28  ████████████ 15
  2026-01-29  ██████ 11
  2026-01-30  ████ 8
  2026-01-31  ██████████ 13
  2026-02-01  ███████ 12

⏱️  Response Time Analysis:
  Average: 3.2 hours
  Median:  1.8 hours
  (Based on 24 samples)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## API Rate Limits

Gmail API quotas (per day):
- **Free tier**: 1 billion quota units
- **Read**: 5 units per request
- **Modify**: 10 units per request
- **Send**: 100 units per request

Built-in rate limiting (250ms delays) keeps you well within limits.

## Troubleshooting

### "Authentication Error"

1. Delete `~/.email-workflow/tokens.json`
2. Run `npm run auth` again
3. Complete OAuth flow in browser

### "Insufficient Permissions"

- Verify Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen configuration
- Ensure correct scopes are requested

### "Rate Limit Exceeded"

- Built-in rate limiting should prevent this
- If it happens, wait 24 hours
- Or request quota increase in Google Cloud Console

### "credentials.json not found"

Download OAuth credentials from Google Cloud Console and save as `credentials.json` in the project root.

## Security & Privacy

- All tokens stored locally in `~/.email-workflow/`
- No email content sent to external services
- OAuth tokens encrypted by system
- Revoke access anytime in Google Account settings

## Project Structure

```
email-workflow-manager/
├── scripts/
│   ├── gmail-auth.js         # OAuth authentication
│   ├── email-manager.js      # Main CLI tool
│   ├── categorizer.js        # Email categorization logic
│   ├── auto-responder.js     # Auto-reply functionality
│   └── analytics.js          # Analytics and statistics
├── config/
│   ├── categories.json       # Category definitions
│   └── templates.json        # Email templates
├── tests/
│   └── email-manager.test.js # Unit tests
├── SKILL.md                  # Detailed documentation
├── README.md                 # This file
├── package.json              # Dependencies
└── .env.example             # Configuration template
```

## Development

### Run Tests

```bash
npm test
```

### Add New Category

1. Edit `config/categories.json`
2. Add keywords, sender patterns, and subject patterns
3. Set priority (1 = highest)

### Add New Template

1. Edit `config/templates.json`
2. Define subject and body with variables
3. Use in auto-reply commands

## Dependencies

- **googleapis** (^128.0.0): Gmail API client
- **csv-writer** (^1.6.0): CSV export functionality
- **dotenv** (^16.3.1): Environment variable management

## License

MIT

## Support

For issues, questions, or feature requests, visit the OpenClaw community forums.

## Version History

### 1.0.0
- Initial release
- Email categorization
- Auto-labeling
- Auto-responder
- Email analytics
- CSV export

## Credits

Developed for the OpenClaw ecosystem.
