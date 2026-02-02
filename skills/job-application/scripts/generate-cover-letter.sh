#!/usr/bin/env bash
# Cover letter generation script
# Uses OpenClaw agent with Ollama or Claude to generate tailored cover letters
# Usage: ./generate-cover-letter.sh <job_url> [company_name] [job_title]

set -euo pipefail

# Configuration
SKILLS_DIR="${OPENCLAW_SKILLS_DIR:-$HOME/.openclaw/skills/job-application}"
CV_DATA="$SKILLS_DIR/assets/cv-data.json"
TEMPLATE="$SKILLS_DIR/assets/cover-letter-template.md"
OUTPUT_DIR="${OPENCLAW_HOME:-$HOME/.openclaw}/cover-letters"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Input parameters
JOB_URL="${1:-}"
COMPANY_NAME="${2:-}"
JOB_TITLE="${3:-}"

if [ -z "$JOB_URL" ]; then
    echo "Usage: $0 <job_url> [company_name] [job_title]"
    exit 1
fi

# Output file
OUTPUT_FILE="$OUTPUT_DIR/cover-letter-$(date +%Y%m%d-%H%M%S).md"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Cover Letter Generator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Step 1: Fetch job posting content
echo -e "${YELLOW}Step 1: Fetching job posting...${NC}"

JOB_CONTENT=$(mktemp)
curl -sL "$JOB_URL" > "$JOB_CONTENT" || {
    echo "Error: Failed to fetch job posting from $JOB_URL"
    exit 1
}

echo -e "${GREEN}✓ Job posting fetched${NC}"

# Step 2: Extract job details if not provided
if [ -z "$COMPANY_NAME" ] || [ -z "$JOB_TITLE" ]; then
    echo -e "${YELLOW}Step 2: Extracting job details...${NC}"

    # Use OpenClaw to extract details
    EXTRACTION_PROMPT="Extract from this job posting:
- Company name
- Job title
- Key requirements (skills, experience)
- Location
- Salary range (if mentioned)
- Remote/hybrid/onsite

Format as JSON:
{
  \"company\": \"...\",
  \"title\": \"...\",
  \"requirements\": [...],
  \"location\": \"...\",
  \"salary\": \"...\",
  \"work_arrangement\": \"...\"
}

Job posting:
$(cat "$JOB_CONTENT" | sed 's/<[^>]*>//g' | head -200)"

    JOB_DETAILS=$(mktemp)
    echo "$EXTRACTION_PROMPT" | openclaw agent --message - --thinking low --model "${OPENCLAW_MODEL:-haiku}" > "$JOB_DETAILS"

    # Extract company and title if not provided
    if [ -z "$COMPANY_NAME" ]; then
        COMPANY_NAME=$(jq -r '.company // "Unknown Company"' "$JOB_DETAILS" 2>/dev/null || echo "Unknown Company")
    fi

    if [ -z "$JOB_TITLE" ]; then
        JOB_TITLE=$(jq -r '.title // "Position"' "$JOB_DETAILS" 2>/dev/null || echo "Position")
    fi

    echo -e "${GREEN}✓ Company: $COMPANY_NAME${NC}"
    echo -e "${GREEN}✓ Title: $JOB_TITLE${NC}"
fi

# Step 3: Load CV data
echo -e "${YELLOW}Step 3: Loading CV data...${NC}"

if [ ! -f "$CV_DATA" ]; then
    echo "Error: CV data not found at $CV_DATA"
    exit 1
fi

echo -e "${GREEN}✓ CV data loaded${NC}"

# Step 4: Generate cover letter
echo -e "${YELLOW}Step 4: Generating tailored cover letter...${NC}"

GENERATION_PROMPT="You are a professional cover letter writer. Generate a tailored German cover letter for Alexander Kölnberger based on:

1. His CV data (below)
2. The job posting (below)
3. The cover letter template (below)

Requirements:
- Write in German (formal business style)
- Highlight 2-3 most relevant experiences/achievements
- Match technical skills to job requirements
- Show genuine interest in the company and role
- Keep it concise (1 page max)
- Use professional but not overly formal tone
- Emphasize unique value proposition (CompTech DSL, 70+ certs, etc.)

CV Data:
$(cat "$CV_DATA")

Job Posting:
Company: $COMPANY_NAME
Title: $JOB_TITLE
URL: $JOB_URL
Content: $(cat "$JOB_CONTENT" | sed 's/<[^>]*>//g' | head -300)

Template Structure:
$(cat "$TEMPLATE")

Generate the complete cover letter now:"

# Generate using OpenClaw with preferred model
echo "$GENERATION_PROMPT" | openclaw agent --message - --thinking low --model "${OPENCLAW_MODEL:-sonnet}" > "$OUTPUT_FILE"

echo -e "${GREEN}✓ Cover letter generated${NC}"

# Step 5: Post-process and format
echo -e "${YELLOW}Step 5: Formatting cover letter...${NC}"

# Add date
CURRENT_DATE=$(date "+%d.%m.%Y")

# Replace template variables
sed -i "s/{{DATE}}/$CURRENT_DATE/g" "$OUTPUT_FILE" 2>/dev/null || true
sed -i "s/{{COMPANY_NAME}}/$COMPANY_NAME/g" "$OUTPUT_FILE" 2>/dev/null || true
sed -i "s/{{JOB_TITLE}}/$JOB_TITLE/g" "$OUTPUT_FILE" 2>/dev/null || true

echo -e "${GREEN}✓ Cover letter formatted${NC}"

# Step 6: Save metadata
METADATA_FILE="${OUTPUT_FILE}.meta.json"
jq -n \
    --arg company "$COMPANY_NAME" \
    --arg title "$JOB_TITLE" \
    --arg url "$JOB_URL" \
    --arg date "$CURRENT_DATE" \
    --arg file "$OUTPUT_FILE" \
    '{
        company: $company,
        job_title: $title,
        job_url: $url,
        generated_date: $date,
        cover_letter_file: $file
    }' > "$METADATA_FILE"

echo -e "${GREEN}✓ Metadata saved${NC}"

# Display result
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Cover Letter Generated${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Company: ${GREEN}$COMPANY_NAME${NC}"
echo -e "Position: ${GREEN}$JOB_TITLE${NC}"
echo -e "File: ${GREEN}$OUTPUT_FILE${NC}"
echo -e "Metadata: ${GREEN}$METADATA_FILE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Display preview
echo -e "${YELLOW}Preview (first 20 lines):${NC}"
head -20 "$OUTPUT_FILE"
echo -e "${YELLOW}...${NC}"

# Clean up
rm -f "$JOB_CONTENT" "$JOB_DETAILS" 2>/dev/null || true

echo -e "${GREEN}Cover letter generation complete!${NC}"
echo -e "Review and edit: ${BLUE}$OUTPUT_FILE${NC}"
