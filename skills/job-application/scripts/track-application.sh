#!/usr/bin/env bash
# Application tracking script
# Usage:
#   ./track-application.sh add "Company" "Job Title" "Status" "Date" "URL"
#   ./track-application.sh update "Company" "New Status"
#   ./track-application.sh list
#   ./track-application.sh export

set -euo pipefail

# Database location
DB_FILE="${OPENCLAW_HOME:-$HOME/.openclaw}/job-applications.db"

# Ensure database directory exists
mkdir -p "$(dirname "$DB_FILE")"

# Initialize database if it doesn't exist
init_db() {
    if [ ! -f "$DB_FILE" ]; then
        sqlite3 "$DB_FILE" <<SQL
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    status TEXT NOT NULL,
    applied_date TEXT NOT NULL,
    url TEXT,
    cover_letter_path TEXT,
    notes TEXT,
    salary_range TEXT,
    location TEXT,
    contact_person TEXT,
    contact_email TEXT,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE interview_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    interview_date TEXT NOT NULL,
    interview_type TEXT,
    interviewer_name TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE INDEX idx_company ON applications(company);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_applied_date ON applications(applied_date);
SQL
    fi
}

# Add new application
add_application() {
    local company="$1"
    local job_title="$2"
    local status="${3:-Applied}"
    local applied_date="${4:-$(date +%Y-%m-%d)}"
    local url="${5:-}"

    sqlite3 "$DB_FILE" <<SQL
INSERT INTO applications (company, job_title, status, applied_date, url)
VALUES ('$company', '$job_title', '$status', '$applied_date', '$url');
SQL

    echo "✓ Added application: $company - $job_title"
}

# Update application status
update_status() {
    local company="$1"
    local new_status="$2"
    local notes="${3:-}"

    # Get current status and application ID
    local result
    result=$(sqlite3 "$DB_FILE" "SELECT id, status FROM applications WHERE company = '$company' ORDER BY created_at DESC LIMIT 1;")

    if [ -z "$result" ]; then
        echo "Error: No application found for company '$company'"
        return 1
    fi

    local app_id old_status
    app_id=$(echo "$result" | cut -d'|' -f1)
    old_status=$(echo "$result" | cut -d'|' -f2)

    # Update status
    sqlite3 "$DB_FILE" <<SQL
UPDATE applications SET status = '$new_status', last_updated = CURRENT_TIMESTAMP WHERE id = $app_id;
INSERT INTO status_history (application_id, old_status, new_status, notes)
VALUES ($app_id, '$old_status', '$new_status', '$notes');
SQL

    echo "✓ Updated $company: $old_status → $new_status"
}

# List all applications
list_applications() {
    local status_filter="${1:-}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Job Applications Tracker"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [ -n "$status_filter" ]; then
        sqlite3 -header -column "$DB_FILE" \
            "SELECT company, job_title, status, applied_date, last_updated
             FROM applications
             WHERE status = '$status_filter'
             ORDER BY last_updated DESC;"
    else
        sqlite3 -header -column "$DB_FILE" \
            "SELECT company, job_title, status, applied_date, last_updated
             FROM applications
             ORDER BY last_updated DESC;"
    fi

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Statistics
    local total pending interviews rejected offers
    total=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM applications;")
    pending=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM applications WHERE status IN ('Applied', 'In Review');")
    interviews=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM applications WHERE status LIKE '%Interview%';")
    rejected=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM applications WHERE status = 'Rejected';")
    offers=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM applications WHERE status = 'Offer Received';")

    echo "Total: $total | Pending: $pending | Interviews: $interviews | Rejected: $rejected | Offers: $offers"
}

# Show application details
show_details() {
    local company="$1"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Application Details: $company"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    sqlite3 -header -column "$DB_FILE" \
        "SELECT * FROM applications WHERE company = '$company' ORDER BY created_at DESC LIMIT 1;"

    echo ""
    echo "Status History:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    local app_id
    app_id=$(sqlite3 "$DB_FILE" "SELECT id FROM applications WHERE company = '$company' ORDER BY created_at DESC LIMIT 1;")

    sqlite3 -header -column "$DB_FILE" \
        "SELECT old_status, new_status, changed_at, notes
         FROM status_history
         WHERE application_id = $app_id
         ORDER BY changed_at DESC;"
}

# Export to CSV
export_csv() {
    local output_file="${1:-job-applications-$(date +%Y%m%d).csv}"

    sqlite3 -header -csv "$DB_FILE" \
        "SELECT company, job_title, status, applied_date, url, location, salary_range, last_updated, created_at
         FROM applications
         ORDER BY applied_date DESC;" > "$output_file"

    echo "✓ Exported to $output_file"
}

# Add interview
add_interview() {
    local company="$1"
    local interview_date="$2"
    local interview_type="${3:-Phone Screen}"
    local interviewer="${4:-}"
    local notes="${5:-}"

    local app_id
    app_id=$(sqlite3 "$DB_FILE" "SELECT id FROM applications WHERE company = '$company' ORDER BY created_at DESC LIMIT 1;")

    if [ -z "$app_id" ]; then
        echo "Error: No application found for company '$company'"
        return 1
    fi

    sqlite3 "$DB_FILE" <<SQL
INSERT INTO interview_schedule (application_id, interview_date, interview_type, interviewer_name, notes)
VALUES ($app_id, '$interview_date', '$interview_type', '$interviewer', '$notes');

UPDATE applications SET status = 'Interview Scheduled', last_updated = CURRENT_TIMESTAMP WHERE id = $app_id;
SQL

    echo "✓ Added interview for $company on $interview_date ($interview_type)"
}

# Main command dispatcher
main() {
    init_db

    case "${1:-list}" in
        add)
            shift
            add_application "$@"
            ;;
        update)
            shift
            update_status "$@"
            ;;
        list)
            shift
            list_applications "$@"
            ;;
        details)
            shift
            show_details "$@"
            ;;
        interview)
            shift
            add_interview "$@"
            ;;
        export)
            shift
            export_csv "$@"
            ;;
        *)
            echo "Usage: $0 {add|update|list|details|interview|export} [args...]"
            echo ""
            echo "Commands:"
            echo "  add <company> <job_title> [status] [date] [url]"
            echo "  update <company> <new_status> [notes]"
            echo "  list [status_filter]"
            echo "  details <company>"
            echo "  interview <company> <date> [type] [interviewer] [notes]"
            echo "  export [output_file]"
            exit 1
            ;;
    esac
}

main "$@"
