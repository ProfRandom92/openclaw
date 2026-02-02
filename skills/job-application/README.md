# OpenClaw Job Application Agent 💼

Automated job searching, application generation, and tracking powered by OpenClaw + AI.

## Features

✅ **Automated Job Search**
- Search 20+ job boards simultaneously (Indeed, LinkedIn, StepStone, XING, etc.)
- Filter by location, salary, remote/hybrid preferences
- API integration (Adzuna, Jooble) for bulk searching
- Company career page monitoring

✅ **AI-Powered Cover Letter Generation**
- Tailored cover letters for each position
- Analyzes job requirements and matches your skills
- German language support (professional business style)
- Uses local Ollama models for privacy

✅ **Application Tracking**
- SQLite database for organized tracking
- Status history and timeline
- Interview scheduling
- Statistics and reporting
- Export to CSV

✅ **Privacy-Focused**
- Local Ollama integration (no external API calls)
- All CV data stored locally
- No data sent to OpenClaw servers
- Full control over your data

✅ **Multi-Channel Notifications**
- Telegram, WhatsApp, Discord, Slack integration
- Daily job search summaries
- Interview reminders
- Application status updates

## Quick Start

### One-Line Installation

```bash
curl -fsSL https://raw.githubusercontent.com/openclaw/openclaw/main/scripts/install-job-agent.sh | bash
```

Or if you're in the OpenClaw repository:

```bash
bash scripts/install-job-agent.sh
```

This will:
1. Check and install prerequisites (curl, jq, git)
2. Install OpenClaw (if not present)
3. Install Ollama (optional, recommended)
4. Set up the job application skill
5. Configure daily automation (optional)
6. Guide you through CV customization

### Manual Installation

```bash
# Install OpenClaw
npm install -g openclaw@latest

# Install Ollama (for local LLM)
brew install ollama  # macOS
# or
curl -fsSL https://ollama.com/install.sh | sh  # Linux

# Pull recommended AI model
ollama pull llama3.3:70b

# Copy skill to OpenClaw skills directory
cp -r skills/job-application ~/.openclaw/skills/

# Make scripts executable
chmod +x ~/.openclaw/skills/job-application/scripts/*.sh
```

## Usage

### Search for Jobs

```bash
# Interactive agent mode
openclaw agent

# In the agent session:
> Search for AI Developer jobs in Germany with remote option and minimum €60k salary

# Or one-liner
openclaw agent --message "Search for AI Developer jobs in Germany"
```

### Generate Cover Letter

```bash
# Using the script
~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh \
  https://job-posting-url.com \
  "Company Name" \
  "Job Title"

# Via OpenClaw agent
openclaw agent --message "Generate cover letter for this job: https://job-url.com"
```

### Track Applications

```bash
# Add application
~/.openclaw/skills/job-application/scripts/track-application.sh add \
  "NVIDIA" "AI Engineer" "Applied" "2025-02-02" "https://nvidia.com/careers/..."

# Update status
~/.openclaw/skills/job-application/scripts/track-application.sh update \
  "NVIDIA" "Interview Scheduled"

# List all applications
~/.openclaw/skills/job-application/scripts/track-application.sh list

# View details
~/.openclaw/skills/job-application/scripts/track-application.sh details "NVIDIA"

# Add interview
~/.openclaw/skills/job-application/scripts/track-application.sh interview \
  "NVIDIA" "2025-02-10 14:00" "Phone Screen" "Jane Doe"

# Export to CSV
~/.openclaw/skills/job-application/scripts/track-application.sh export
```

### Automated Daily Job Search

```bash
# Set up cron job for daily searches at 9 AM
openclaw cron add \
  --name "Daily Job Search" \
  --schedule "0 9 * * *" \
  --command "openclaw agent --message 'Run daily job search and apply to matching positions' --thinking low" \
  --deliver telegram:me
```

## Configuration

### Customize Your CV Data

Edit your CV information:

```bash
# Using your preferred editor
code ~/.openclaw/skills/job-application/assets/cv-data.json
# or
nano ~/.openclaw/skills/job-application/assets/cv-data.json
```

Update the following fields:
- `personal`: Name, contact info, LinkedIn, GitHub
- `summary`: Professional summary
- `experience`: Work history with achievements
- `education`: Degrees and certifications
- `skills`: Technical and soft skills
- `preferences`: Target roles, locations, salary, benefits

### Set Up Job Board API Keys

For automated searching, configure API keys:

```bash
# Adzuna API (free tier: 100 calls/month)
# Sign up at: https://developer.adzuna.com

# Using 1Password CLI
op item create --category=Login --title="Adzuna API" \
  --field="app_id=YOUR_APP_ID" \
  --field="app_key=YOUR_APP_KEY"

# Or set environment variables
export ADZUNA_APP_ID="your_app_id"
export ADZUNA_APP_KEY="your_app_key"
```

### Configure Ollama Model

```bash
# Set default model
openclaw config set model.default ollama:llama3.3:70b

# Or use environment variable
export OPENCLAW_MODEL=ollama:llama3.3:70b
```

## File Structure

```
~/.openclaw/skills/job-application/
├── SKILL.md                      # Skill metadata and instructions
├── README.md                     # This file
├── assets/
│   ├── cv-data.json              # Your CV data (CUSTOMIZE THIS!)
│   └── cover-letter-template.md  # Cover letter template
├── scripts/
│   ├── search-jobs.sh            # Job search automation
│   ├── generate-cover-letter.sh  # Cover letter generation
│   └── track-application.sh      # Application tracking
└── references/
    ├── ollama-integration.md     # Ollama setup guide
    └── job-boards.md             # Job board list and APIs

~/.openclaw/
├── job-applications.db           # Application tracking database
├── cover-letters/                # Generated cover letters
└── job-search-results/           # Search results cache
```

## Examples

### Full Application Workflow

```bash
# 1. Search for jobs
openclaw agent --message "Search for Cloud Security Engineer roles in Germany, remote/hybrid, €70k+"

# Agent returns 5 matching positions

# 2. Generate cover letter for top match
~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh \
  "https://careers.microsoft.com/job/12345"

# 3. Review and edit cover letter
code ~/.openclaw/cover-letters/cover-letter-20250202-120000.md

# 4. Apply to position (manual or automated)

# 5. Track application
~/.openclaw/skills/job-application/scripts/track-application.sh add \
  "Microsoft" "Cloud Security Engineer" "Applied" "2025-02-02" \
  "https://careers.microsoft.com/job/12345"

# 6. Update status when you hear back
~/.openclaw/skills/job-application/scripts/track-application.sh update \
  "Microsoft" "Interview Scheduled"
```

### Using Different AI Models

```bash
# High quality (slow, best for final cover letters)
OPENCLAW_MODEL=ollama:llama3.3:70b \
  ~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh [url]

# Balanced (good quality, faster)
OPENCLAW_MODEL=ollama:qwen2.5:32b \
  ~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh [url]

# Fast (quick drafts)
OPENCLAW_MODEL=ollama:llama3.1:8b \
  ~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh [url]

# Cloud API (highest quality, costs money)
OPENCLAW_MODEL=sonnet \
  ~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh [url]
```

### Batch Processing

```bash
# Generate cover letters for multiple jobs
cat job-urls.txt | while read url; do
  ~/.openclaw/skills/job-application/scripts/generate-cover-letter.sh "$url"
done

# Search multiple keywords
for keyword in "AI Engineer" "Cloud Architect" "Security Specialist"; do
  ~/.openclaw/skills/job-application/scripts/search-jobs.sh "$keyword" "Germany"
done
```

## Best Practices

1. **Customize for Each Job**
   - Always review generated cover letters
   - Adjust for specific company culture
   - Research the company before applying

2. **Quality over Quantity**
   - Better to send 3 great applications than 10 generic ones
   - Focus on roles that truly match your skills and interests

3. **Track Everything**
   - Use the tracking system from day one
   - Add notes about each application
   - Set reminders for follow-ups

4. **Privacy First**
   - Use Ollama for sensitive CV data
   - Only use cloud APIs when necessary
   - Never commit real CV data to public repos

5. **Stay Organized**
   - Review applications weekly
   - Follow up after 1-2 weeks
   - Keep all cover letters for reference

6. **Network**
   - Use LinkedIn to connect with hiring managers
   - Research company employees
   - Attend relevant conferences/meetups

## Troubleshooting

### OpenClaw command not found

```bash
# Install globally
npm install -g openclaw@latest

# Or use local version
npx openclaw --version
```

### Ollama connection refused

```bash
# Start Ollama service
ollama serve

# Or on Linux
sudo systemctl start ollama
```

### Cover letter generation fails

```bash
# Check model is available
ollama list

# Pull model if missing
ollama pull llama3.3:70b

# Test Ollama directly
ollama run llama3.3:70b "Hello, world!"
```

### Job search returns no results

```bash
# Check API credentials
op read 'op://Private/Adzuna API/app_id'

# Test API manually
curl "https://api.adzuna.com/v1/api/jobs/de/search/1?app_id=YOUR_ID&app_key=YOUR_KEY&what=AI"
```

## Resources

- [OpenClaw Documentation](https://docs.openclaw.ai)
- [Ollama Integration Guide](./references/ollama-integration.md)
- [Job Boards List](./references/job-boards.md)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Ollama Official Site](https://ollama.com)

## Support

- **Issues:** https://github.com/openclaw/openclaw/issues
- **Discussions:** https://github.com/openclaw/openclaw/discussions
- **Discord:** https://discord.gg/openclaw

## License

This skill is part of the OpenClaw project and follows the same license.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Ideas for contributions:
- Additional job board integrations
- Cover letter templates for other languages
- Interview preparation features
- Salary negotiation guidance
- Application follow-up automation

---

**Happy job hunting! 🚀**
