#!/usr/bin/env bash
# OpenClaw Job Application Agent - One-Click Installation
# Usage: curl -fsSL https://raw.githubusercontent.com/openclaw/openclaw/main/scripts/install-job-agent.sh | bash
# Or: bash scripts/install-job-agent.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
OPENCLAW_DIR="${OPENCLAW_HOME:-$HOME/.openclaw}"
SKILLS_DIR="$OPENCLAW_DIR/skills"
JOB_SKILL_DIR="$SKILLS_DIR/job-application"

# Banner
print_banner() {
    echo -e "${BLUE}"
    cat <<'EOF'
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║           OpenClaw Job Application Agent Installer               ║
║                                                                   ║
║   Automated job search, application generation, and tracking     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Step 1: Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    local missing_deps=()

    # Check for required commands
    for cmd in curl jq git; do
        if ! command_exists "$cmd"; then
            missing_deps+=("$cmd")
        fi
    done

    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Installing missing dependencies..."

        # Detect OS and install
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if ! command_exists brew; then
                log_error "Homebrew not found. Please install from https://brew.sh"
                exit 1
            fi
            brew install "${missing_deps[@]}"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command_exists apt-get; then
                sudo apt-get update && sudo apt-get install -y "${missing_deps[@]}"
            elif command_exists yum; then
                sudo yum install -y "${missing_deps[@]}"
            elif command_exists pacman; then
                sudo pacman -S --noconfirm "${missing_deps[@]}"
            else
                log_error "Unsupported package manager. Please install manually: ${missing_deps[*]}"
                exit 1
            fi
        else
            log_error "Unsupported OS: $OSTYPE"
            exit 1
        fi
    fi

    log_success "All prerequisites met"
}

# Step 2: Install OpenClaw if not present
install_openclaw() {
    if command_exists openclaw; then
        log_success "OpenClaw already installed ($(openclaw --version 2>/dev/null || echo 'unknown version'))"
        return
    fi

    log_info "Installing OpenClaw..."

    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command_exists npm; then
            log_info "Installing Node.js via Homebrew..."
            brew install node
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if ! command_exists npm; then
            log_info "Installing Node.js..."
            if command_exists apt-get; then
                curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif command_exists yum; then
                curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
                sudo yum install -y nodejs
            fi
        fi
    fi

    # Install OpenClaw globally
    log_info "Installing OpenClaw from npm..."
    sudo npm install -g openclaw@latest

    log_success "OpenClaw installed successfully"
}

# Step 3: Install Ollama (optional but recommended)
install_ollama() {
    if command_exists ollama; then
        log_success "Ollama already installed"
        return
    fi

    log_warning "Ollama not found - recommended for privacy-focused local LLM processing"

    read -p "Install Ollama? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        log_info "Installing Ollama..."

        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install ollama
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://ollama.com/install.sh | sh
        fi

        # Start Ollama service
        log_info "Starting Ollama service..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start ollama || ollama serve > /dev/null 2>&1 &
        else
            sudo systemctl enable ollama 2>/dev/null || true
            sudo systemctl start ollama 2>/dev/null || ollama serve > /dev/null 2>&1 &
        fi

        # Pull recommended model
        log_info "Downloading recommended AI model (this may take a few minutes)..."
        ollama pull llama3.3:70b &
        OLLAMA_PULL_PID=$!

        log_success "Ollama installed and started (model download in background)"
    else
        log_warning "Skipping Ollama installation - you can install later with: brew install ollama"
    fi
}

# Step 4: Install job application skill
install_job_skill() {
    log_info "Installing job application skill..."

    # Create directories
    mkdir -p "$JOB_SKILL_DIR"/{scripts,assets,references}

    # Detect if we're in the OpenClaw repo or need to download
    if [ -d "./skills/job-application" ]; then
        # We're in the repo, copy from local
        log_info "Copying skill from local repository..."
        cp -r ./skills/job-application/* "$JOB_SKILL_DIR/"
    else
        # Download from GitHub
        log_info "Downloading skill from GitHub..."

        local base_url="https://raw.githubusercontent.com/openclaw/openclaw/main/skills/job-application"

        # Download SKILL.md
        curl -fsSL "$base_url/SKILL.md" -o "$JOB_SKILL_DIR/SKILL.md"

        # Download assets
        curl -fsSL "$base_url/assets/cv-data.json" -o "$JOB_SKILL_DIR/assets/cv-data.json"
        curl -fsSL "$base_url/assets/cover-letter-template.md" -o "$JOB_SKILL_DIR/assets/cover-letter-template.md"

        # Download scripts
        for script in track-application.sh search-jobs.sh generate-cover-letter.sh; do
            curl -fsSL "$base_url/scripts/$script" -o "$JOB_SKILL_DIR/scripts/$script"
            chmod +x "$JOB_SKILL_DIR/scripts/$script"
        done

        # Download references
        curl -fsSL "$base_url/references/ollama-integration.md" -o "$JOB_SKILL_DIR/references/ollama-integration.md"
        curl -fsSL "$base_url/references/job-boards.md" -o "$JOB_SKILL_DIR/references/job-boards.md"
    fi

    log_success "Job application skill installed to $JOB_SKILL_DIR"
}

# Step 5: Configure OpenClaw
configure_openclaw() {
    log_info "Configuring OpenClaw..."

    # Set default model to Ollama if available
    if command_exists ollama; then
        openclaw config set model.default ollama:llama3.3:70b 2>/dev/null || true
        log_success "Default model set to Ollama (privacy-focused)"
    fi

    # Set skills directory
    export OPENCLAW_SKILLS_DIR="$SKILLS_DIR"

    log_success "OpenClaw configured"
}

# Step 6: Set up daily job search cron (optional)
setup_automation() {
    log_warning "Would you like to set up automated daily job searches?"

    read -p "Enable daily automation? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        log_info "Setting up daily job search at 9:00 AM..."

        openclaw cron add \
            --name "Daily Job Search" \
            --schedule "0 9 * * *" \
            --command "openclaw agent --message 'Run daily job search for AI, Cloud Security, and Microsoft 365 roles in Germany. Filter for remote/hybrid positions with minimum €60k salary. Generate cover letters for top 3 matches.' --thinking low" \
            --deliver telegram:me 2>/dev/null || {
                log_warning "Failed to set up cron job - you can do this manually later"
                log_info "Manual setup: openclaw cron add --name 'Daily Job Search' --schedule '0 9 * * *' --command '...'"
            }

        log_success "Daily automation configured"
    else
        log_info "Skipping automation setup - you can enable later"
    fi
}

# Step 7: Customize CV data
customize_cv() {
    log_info "Customizing your CV data..."

    log_warning "The default CV data is for Alexander Kölnberger"
    read -p "Would you like to edit the CV data now? (Y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if command_exists code; then
            code "$JOB_SKILL_DIR/assets/cv-data.json"
        elif command_exists nano; then
            nano "$JOB_SKILL_DIR/assets/cv-data.json"
        elif command_exists vim; then
            vim "$JOB_SKILL_DIR/assets/cv-data.json"
        else
            log_info "Please edit manually: $JOB_SKILL_DIR/assets/cv-data.json"
        fi
        log_success "CV data ready for customization"
    else
        log_warning "Remember to customize your CV data at: $JOB_SKILL_DIR/assets/cv-data.json"
    fi
}

# Step 8: Test installation
test_installation() {
    log_info "Testing installation..."

    # Test OpenClaw
    if ! openclaw --version &> /dev/null; then
        log_error "OpenClaw test failed"
        return 1
    fi

    # Test skill loading
    if [ ! -f "$JOB_SKILL_DIR/SKILL.md" ]; then
        log_error "Job application skill not found"
        return 1
    fi

    # Test scripts
    for script in track-application.sh search-jobs.sh generate-cover-letter.sh; do
        if [ ! -x "$JOB_SKILL_DIR/scripts/$script" ]; then
            log_error "Script not executable: $script"
            return 1
        fi
    done

    log_success "All tests passed!"
}

# Step 9: Print usage instructions
print_usage() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Installation Complete! 🎉                     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Quick Start Commands:${NC}"
    echo ""
    echo -e "${YELLOW}1. Search for jobs:${NC}"
    echo -e "   openclaw agent --message 'Search for AI Developer jobs in Germany'"
    echo ""
    echo -e "${YELLOW}2. Generate cover letter:${NC}"
    echo -e "   $JOB_SKILL_DIR/scripts/generate-cover-letter.sh https://job-url.com"
    echo ""
    echo -e "${YELLOW}3. Track applications:${NC}"
    echo -e "   $JOB_SKILL_DIR/scripts/track-application.sh add 'NVIDIA' 'AI Engineer' 'Applied'"
    echo -e "   $JOB_SKILL_DIR/scripts/track-application.sh list"
    echo ""
    echo -e "${YELLOW}4. Interactive agent session:${NC}"
    echo -e "   openclaw agent"
    echo ""
    echo -e "${CYAN}Configuration Files:${NC}"
    echo -e "   CV Data:      ${BLUE}$JOB_SKILL_DIR/assets/cv-data.json${NC}"
    echo -e "   Templates:    ${BLUE}$JOB_SKILL_DIR/assets/cover-letter-template.md${NC}"
    echo -e "   Scripts:      ${BLUE}$JOB_SKILL_DIR/scripts/${NC}"
    echo ""
    echo -e "${CYAN}Documentation:${NC}"
    echo -e "   Ollama Guide: ${BLUE}$JOB_SKILL_DIR/references/ollama-integration.md${NC}"
    echo -e "   Job Boards:   ${BLUE}$JOB_SKILL_DIR/references/job-boards.md${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "   1. Customize your CV data: ${BLUE}$JOB_SKILL_DIR/assets/cv-data.json${NC}"
    echo -e "   2. Set up job board API keys (see job-boards.md)"
    echo -e "   3. Configure messaging channels for notifications"
    echo -e "   4. Run your first job search!"
    echo ""

    if [ -n "${OLLAMA_PULL_PID:-}" ]; then
        echo -e "${YELLOW}Note: Ollama model download is still running in background (PID: $OLLAMA_PULL_PID)${NC}"
        echo -e "${YELLOW}Check progress: ps -p $OLLAMA_PULL_PID${NC}"
        echo ""
    fi
}

# Main installation flow
main() {
    print_banner

    log_info "Starting installation..."

    check_prerequisites
    install_openclaw
    install_ollama
    install_job_skill
    configure_openclaw
    setup_automation
    customize_cv
    test_installation

    print_usage

    log_success "Job Application Agent is ready to use!"
}

# Run main installation
main "$@"
