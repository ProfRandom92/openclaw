---
name: job-application
description: "Automated job application agent that searches for jobs, generates tailored cover letters and applications, and tracks application status."
metadata:
  {
    "openclaw":
      {
        "emoji": "💼",
        "requires": { "bins": ["curl", "jq"] },
        "install":
          [
            {
              "id": "jq-brew",
              "kind": "brew",
              "formula": "jq",
              "bins": ["jq"],
              "label": "Install jq (brew)",
            },
            {
              "id": "jq-apt",
              "kind": "apt",
              "package": "jq",
              "bins": ["jq"],
              "label": "Install jq (apt)",
            },
          ],
      },
  }
---

# Job Application Agent Skill

This skill enables automated job searching and application generation based on your CV and preferences.

## Your Profile

**Name:** Alexander Kölnberger
**Location:** Neckarsulm, Germany
**Email:** conrigs92@gmail.com
**Phone:** +49 160 92334709

### Professional Summary

Cross-functional leader with 11 years of experience in process optimization and operational coordination. Currently a Security Specialist at CIBORUS Security & Service Solutions with expertise in military security operations. Strong technical background with 70+ professional certifications in IT Security, Cloud Technologies, and AI Agent Development. Specialized in Microsoft 365, Cybersecurity, AI Agent Development, and Cloud Infrastructure with an 85% token reduction in AI systems.

### Key Skills

**Technical Competencies:**
- **Cybersecurity:** Industrial Cybersecurity, OT Security, Cloud Security, Endpoint Security, SIEM
- **AI & Machine Learning:** AI Agent Development, Prompt Engineering, LLM Operations, Generative AI, NLP, Computer Vision
- **Microsoft Ecosystem:** Microsoft 365, Entra ID, Azure, Teams, SharePoint, Power Platform, Copilot
- **Cloud & Infrastructure:** Google Cloud Platform, Cloud Security, Linux, Testing/Automation
- **Data & Analytics:** Data Engineering, Data Science, Data Analytics, Data Visualization
- **Automation & Integration:** Zapier, n8n, API-Integration, Workflow-Automation
- **Project Management:** CompTech (Domain-Specific Language for AI Systems with 85% Token-Reduction)

**Soft Skills:**
- Process optimization & digitalization (12 employees team leadership)
- Project management & agile methods
- Risk management & compliance
- Crisis management & conflict resolution
- Interpersonal communication & consulting
- Documentation & reporting
- Business networking & customer relations

**Languages:**
- German: Native
- English: Professional proficiency (B2-C1)

### Education & Certifications

**Education:**
- AI Agent Developer Specialization (Professional Program) - Vanderbilt University, 2025
- Microsoft Security Professional - Microsoft, 2024-2025
- Sachkundeprüfung §34a GewO - IHK, 2013
- Realschulabschluss - Friedrich-Ebert-Schule Pfungstadt, 2010

**Professional Certifications (70+ total):**
- AI & Machine Learning: AI Agent Development, Prompt Engineering, LLM Operations, Generative AI
- Microsoft Technologies: Microsoft 365 Administration, Microsoft Entra ID, Microsoft Security
- Cybersecurity: Industrial Cybersecurity, OT Security, Cloud Security, Endpoint Security
- Data & Analytics: Data Engineering, Data Science, Data Analytics, Data Visualization
- Compliance & Standards: ISO 27001, GRC (Governance, Risk & Compliance), Security Awareness
- Cloud Platforms: Google Cloud Platform (GCP), Cloud Infrastructure
- Project Management: Agile Projektmanagement, Lean Management

### Work Experience

**Security Specialist** - CIBORUS Security & Service Solutions (seit 08/2024)
- BW Hohe Mindern, BW Langenschaft Schwetzingen
- Responsible for security tasks at military facilities
- Coordination of security-relevant processes and documentation
- Ensure compliance and security standards in critical infrastructure

**Office Manager & Geschäftsführungsassistenz** - Familienunternehmen (02/2013 – 08/2024)
- Responsible for operational business management with 8-12 employees in security-critical projects
- Optimization of business processes through digitalization, especially tour planning and billing
- Interface management between teams, customers, and external partners
- Coordination of communication, documentation, and administrative processes

**Jugendbetreuer & Konfliktmanager** - Jugendzentrum Blue, Ginsheim (09/2010 – 09/2012)
- Support of young people in challenging life situations through counseling and conflict resolution
- Planning and execution of leisure activities, workshops, and events to promote social competencies
- Building trust relationships and care for young people

## Job Search Preferences

### Target Roles
- AI Agent Developer / AI Engineer
- Cloud Security Specialist / Security Engineer
- Microsoft 365 Administrator / Solutions Architect
- DevOps Engineer / Cloud Infrastructure Engineer
- Data Engineer / Analytics Engineer
- Cybersecurity Analyst / Security Consultant
- Automation Engineer / Integration Specialist

### Preferred Locations
- Remote (preferred)
- Germany (Neckarsulm, Stuttgart, Heilbronn, Frankfurt, München, Berlin)
- Europe (willing to relocate for the right opportunity)

### Minimum Requirements
- Salary: €60,000+ annually (negotiable based on role and location)
- Work arrangement: Remote-first or hybrid (max 2 days/week on-site)
- Contract type: Full-time, permanent position preferred
- Company size: Open to startups, mid-size, and enterprise
- Industry: Technology, Cybersecurity, Cloud Services, AI/ML, Consulting

### Preferred Benefits
- Professional development budget
- Flexible working hours
- Modern tech stack
- International team
- Certification support
- Conference attendance
- Home office equipment budget

## Available Commands

### Search for Jobs

Use web search and job platforms to find relevant positions:

```bash
# Search job boards
curl -s "https://api.adzuna.com/v1/api/jobs/de/search/1?app_id=YOUR_ID&app_key=YOUR_KEY&results_per_page=20&what=AI%20Agent%20Developer&where=Germany" | jq '.results[] | {title: .title, company: .company.display_name, location: .location.display_name, url: .redirect_url}'

# Search LinkedIn Jobs (via web scraping or API)
# Search Indeed, StepStone, XING, etc.
```

### Generate Cover Letter

The agent will generate a tailored cover letter based on:
- Job description analysis
- Matching skills from your CV
- Company research
- Role-specific customization

Template structure:
1. Opening with specific job reference
2. Why you're interested (company + role fit)
3. Relevant experience highlighting (2-3 key achievements)
4. Technical skills match
5. Value proposition
6. Call to action

### Track Applications

Maintain application status in a structured format:

```bash
# Add new application
./scripts/track-application.sh add "Company Name" "Job Title" "Applied" "2025-02-02" "https://job-url"

# Update application status
./scripts/track-application.sh update "Company Name" "Interview Scheduled"

# List all applications
./scripts/track-application.sh list
```

### Automated Application Workflow

1. **Daily Job Search:** Scan configured job boards for new matching positions
2. **Job Filtering:** Apply preference filters (location, salary, remote, etc.)
3. **Application Generation:** Create tailored cover letter and prepare CV
4. **Submission:** Auto-submit where possible, flag manual applications
5. **Follow-up:** Track application status and schedule follow-ups

## Usage Examples

### Manual Job Application

```
User: "I found a job posting for AI Agent Developer at Microsoft. Can you help me apply?"
Agent: *Analyzes job posting*
       *Generates tailored cover letter highlighting:*
       - AI Agent Development specialization from Vanderbilt
       - Microsoft 365 and Azure expertise
       - 70+ certifications including Microsoft Security Professional
       - CompTech DSL experience with 85% token reduction
       *Prepares application package*
       "I've prepared your application for the AI Agent Developer role at Microsoft. The cover letter emphasizes your Microsoft ecosystem expertise and AI specialization. Ready to submit?"
```

### Automated Daily Job Search

```
User: "Run daily job search and apply to matching positions"
Agent: *Searches configured job boards*
       *Finds 5 matching positions*
       *Filters by preferences (remote, €60k+, Germany)*
       *3 positions match all criteria*

       Position 1: Senior AI Engineer at NVIDIA (Remote, Munich)
       - Generated tailored application
       - Submitted via careers portal
       - Added to tracking system

       Position 2: Cloud Security Architect at SAP (Hybrid, Walldorf)
       - Generated tailored application
       - Manual submission required (custom form)
       - Flagged for review

       Position 3: Microsoft 365 Solutions Architect at Accenture (Remote)
       - Generated tailored application
       - Submitted via LinkedIn Easy Apply
       - Added to tracking system

       "Applied to 2 positions, 1 flagged for manual review."
```

### Application Status Update

```
User: "Update application status for NVIDIA"
Agent: *Checks email for responses*
       *Found interview invitation*
       *Updated tracking system*
       "NVIDIA status updated to 'Interview Scheduled' (2025-02-10, 14:00 CET via Teams). I've added it to your calendar. Would you like me to prepare interview preparation materials based on the job description?"
```

## Configuration

### Job Board API Keys

Store API credentials using the 1password skill:

```bash
# Adzuna API
op item create --category=Login --title="Adzuna API" \
  --field="app_id=YOUR_ID" \
  --field="app_key=YOUR_KEY"

# LinkedIn API
op item create --category=Login --title="LinkedIn API" \
  --field="client_id=YOUR_ID" \
  --field="client_secret=YOUR_SECRET"
```

### Automated Search Schedule

Configure cron job for daily searches:

```bash
openclaw cron add \
  --name "Daily Job Search" \
  --schedule "0 9 * * *" \
  --command "openclaw agent --message 'Run daily job search and apply to matching positions' --thinking low" \
  --deliver telegram:me
```

## Integration with Ollama

For privacy-conscious local LLM processing:

```bash
# Use Ollama for cover letter generation (keeps data local)
OPENCLAW_MODEL=ollama:llama3.3:70b openclaw agent --message "Generate cover letter for this job: [JOB_URL]"

# Recommended Ollama models for job applications:
# - llama3.3:70b (best quality, slower)
# - qwen2.5:32b (good balance)
# - llama3.1:8b (fastest, decent quality)
```

## Privacy & Data Security

- All CV data stored locally in `~/.openclaw/`
- Use local Ollama models to avoid sending CV data to external APIs
- Job applications tracked in local SQLite database
- API keys stored in 1Password or encrypted vault
- No CV data transmitted to OpenClaw servers

## Best Practices

1. **Customize for Each Job:** Even with automation, review and customize each application
2. **Quality over Quantity:** Better to send 3 great applications than 10 generic ones
3. **Follow Up:** Set reminders to follow up after 1-2 weeks
4. **Track Everything:** Maintain detailed application records
5. **Network:** Use LinkedIn to connect with hiring managers
6. **Prepare for Interviews:** Research company and role thoroughly
7. **Be Honest:** Never exaggerate skills or experience
8. **Proofread:** Always review generated content before submission

## Files and Assets

- `assets/cv-data.json` - Structured CV data
- `assets/cover-letter-template.md` - Base cover letter template
- `assets/application-tracking.db` - SQLite database for tracking
- `scripts/search-jobs.sh` - Job search automation
- `scripts/generate-cover-letter.sh` - Cover letter generation
- `scripts/track-application.sh` - Application tracking
- `references/job-boards.md` - List of job boards and APIs
- `references/interview-prep.md` - Interview preparation guide
