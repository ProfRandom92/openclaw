#!/usr/bin/env bash
# Job search automation script
# Searches multiple job boards and aggregates results
# Usage: ./search-jobs.sh [keywords] [location]

set -euo pipefail

# Configuration
SKILLS_DIR="${OPENCLAW_SKILLS_DIR:-$HOME/.openclaw/skills/job-application}"
CV_DATA="$SKILLS_DIR/assets/cv-data.json"
RESULTS_DIR="${OPENCLAW_HOME:-$HOME/.openclaw}/job-search-results"

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

# Default search parameters from CV
KEYWORDS="${1:-AI Agent Developer}"
LOCATION="${2:-Germany}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Job Search Agent${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Keywords: ${GREEN}$KEYWORDS${NC}"
echo -e "Location: ${GREEN}$LOCATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Output file
OUTPUT_FILE="$RESULTS_DIR/jobs-$(date +%Y%m%d-%H%M%S).json"

# Initialize results
echo "[]" > "$OUTPUT_FILE"

# Function to add job to results
add_job() {
    local title="$1"
    local company="$2"
    local location="$3"
    local url="$4"
    local source="$5"
    local salary="${6:-}"
    local remote="${7:-false}"

    # Create job entry
    local job_entry
    job_entry=$(jq -n \
        --arg title "$title" \
        --arg company "$company" \
        --arg location "$location" \
        --arg url "$url" \
        --arg source "$source" \
        --arg salary "$salary" \
        --arg remote "$remote" \
        --arg found_at "$(date -Iseconds)" \
        '{
            title: $title,
            company: $company,
            location: $location,
            url: $url,
            source: $source,
            salary: $salary,
            remote: ($remote == "true"),
            found_at: $found_at
        }')

    # Append to results
    jq --argjson job "$job_entry" '. += [$job]' "$OUTPUT_FILE" > "${OUTPUT_FILE}.tmp"
    mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
}

# Search Indeed (scraping or API if available)
search_indeed() {
    echo -e "${YELLOW}Searching Indeed...${NC}"

    # Indeed job search
    # Note: This is a placeholder - actual implementation would use Indeed API or scraping
    # For now, we'll use a generic approach

    local search_url
    search_url="https://de.indeed.com/jobs?q=$(echo "$KEYWORDS" | sed 's/ /%20/g')&l=$(echo "$LOCATION" | sed 's/ /%20/g')"

    echo -e "${GREEN}  Search URL: $search_url${NC}"
    echo -e "${YELLOW}  Note: Indeed scraping requires API key or headless browser${NC}"

    # Placeholder for actual scraping/API integration
    # Would parse HTML or use Indeed API to extract:
    # - Job title
    # - Company name
    # - Location
    # - Job URL
    # - Salary (if available)
    # - Remote indicator
}

# Search LinkedIn Jobs
search_linkedin() {
    echo -e "${YELLOW}Searching LinkedIn...${NC}"

    local search_url
    search_url="https://www.linkedin.com/jobs/search/?keywords=$(echo "$KEYWORDS" | sed 's/ /%20/g')&location=$(echo "$LOCATION" | sed 's/ /%20/g')"

    echo -e "${GREEN}  Search URL: $search_url${NC}"
    echo -e "${YELLOW}  Note: LinkedIn scraping requires authenticated session${NC}"

    # Placeholder for LinkedIn integration
}

# Search StepStone (German job board)
search_stepstone() {
    echo -e "${YELLOW}Searching StepStone...${NC}"

    local search_url
    search_url="https://www.stepstone.de/jobs/$(echo "$KEYWORDS" | sed 's/ /-/g')?location=$(echo "$LOCATION" | sed 's/ /-/g')"

    echo -e "${GREEN}  Search URL: $search_url${NC}"

    # Placeholder for StepStone integration
}

# Search XING Jobs (German professional network)
search_xing() {
    echo -e "${YELLOW}Searching XING...${NC}"

    local search_url
    search_url="https://www.xing.com/jobs/search?keywords=$(echo "$KEYWORDS" | sed 's/ /%20/g')&location=$(echo "$LOCATION" | sed 's/ /%20/g')"

    echo -e "${GREEN}  Search URL: $search_url${NC}"

    # Placeholder for XING integration
}

# Search Adzuna (aggregator with API)
search_adzuna() {
    echo -e "${YELLOW}Searching Adzuna...${NC}"

    # Check for Adzuna API credentials
    if command -v op &> /dev/null; then
        local app_id app_key
        app_id=$(op read "op://Private/Adzuna API/app_id" 2>/dev/null || echo "")
        app_key=$(op read "op://Private/Adzuna API/app_key" 2>/dev/null || echo "")

        if [ -n "$app_id" ] && [ -n "$app_key" ]; then
            local api_url
            api_url="https://api.adzuna.com/v1/api/jobs/de/search/1?app_id=$app_id&app_key=$app_key&results_per_page=20&what=$(echo "$KEYWORDS" | sed 's/ /%20/g')&where=$(echo "$LOCATION" | sed 's/ /%20/g')"

            local response
            response=$(curl -s "$api_url")

            if [ -n "$response" ]; then
                # Parse results and add to output
                echo "$response" | jq -r '.results[] | @json' | while IFS= read -r job; do
                    local title company location url salary remote
                    title=$(echo "$job" | jq -r '.title')
                    company=$(echo "$job" | jq -r '.company.display_name')
                    location=$(echo "$job" | jq -r '.location.display_name')
                    url=$(echo "$job" | jq -r '.redirect_url')
                    salary=$(echo "$job" | jq -r '.salary_min // ""')
                    remote=$(echo "$job" | jq -r 'if .location.display_name | test("(?i)remote") then "true" else "false" end')

                    add_job "$title" "$company" "$location" "$url" "Adzuna" "$salary" "$remote"
                    echo -e "  ${GREEN}✓${NC} $title at $company"
                done
            fi
        else
            echo -e "  ${YELLOW}No Adzuna API credentials found${NC}"
            echo -e "  ${YELLOW}Set up with: op item create --category=Login --title='Adzuna API' --field='app_id=YOUR_ID' --field='app_key=YOUR_KEY'${NC}"
        fi
    else
        echo -e "  ${YELLOW}1Password CLI not available${NC}"
    fi
}

# Search company career pages directly
search_company_pages() {
    echo -e "${YELLOW}Searching company career pages...${NC}"

    # List of target companies from user preferences
    local companies=(
        "microsoft.com/careers"
        "sap.com/careers"
        "siemens.com/careers"
        "google.com/careers"
        "nvidia.com/careers"
        "amazon.jobs"
        "bosch.com/careers"
        "volkswagen.com/careers"
        "bmw.com/careers"
        "daimler.com/careers"
    )

    for company_url in "${companies[@]}"; do
        echo -e "  ${BLUE}Checking $company_url${NC}"
        # Placeholder for company-specific scraping
    done
}

# Filter jobs based on preferences
filter_jobs() {
    echo -e "${YELLOW}Filtering jobs based on preferences...${NC}"

    local preferences
    preferences=$(jq '.preferences' "$CV_DATA")

    local min_salary
    min_salary=$(echo "$preferences" | jq -r '.salary_min // 60000')

    # Filter jobs
    jq --argjson min_salary "$min_salary" '
        map(select(
            (.salary == "" or (.salary | tonumber) >= $min_salary) and
            (.title | test("(?i)AI|Cloud|Security|DevOps|Data|Microsoft|Automation"))
        ))
    ' "$OUTPUT_FILE" > "${OUTPUT_FILE}.filtered"

    local total_jobs filtered_jobs
    total_jobs=$(jq 'length' "$OUTPUT_FILE")
    filtered_jobs=$(jq 'length' "${OUTPUT_FILE}.filtered")

    echo -e "  ${GREEN}Found: $total_jobs jobs${NC}"
    echo -e "  ${GREEN}After filtering: $filtered_jobs jobs${NC}"

    mv "${OUTPUT_FILE}.filtered" "$OUTPUT_FILE"
}

# Display results
display_results() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Search Results${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    jq -r '.[] | "\(.title) - \(.company) (\(.location))\n  \(.url)\n  Source: \(.source) | Salary: \(.salary // "Not specified") | Remote: \(.remote)\n"' "$OUTPUT_FILE"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Results saved to: ${GREEN}$OUTPUT_FILE${NC}"
}

# Main execution
main() {
    # Search all sources
    search_adzuna
    search_indeed
    search_linkedin
    search_stepstone
    search_xing
    search_company_pages

    # Filter results
    filter_jobs

    # Display results
    display_results

    echo -e "${GREEN}Job search complete!${NC}"
}

main
