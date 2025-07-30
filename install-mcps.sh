#!/bin/bash
# WAOK-AI-STEM MCP Installation Script
# This script installs all required MCP servers for the project

echo "=========================================="
echo "WAOK-AI-STEM MCP Installation Script"
echo "=========================================="
echo ""
echo "IMPORTANT: Before running this script:"
echo "1. Update the GITHUB_TOKEN variable"
echo "2. Update the NETLIFY_TOKEN variable"
echo "3. Update WSL_HOME and WINDOWS_DESKTOP paths"
echo "4. Ensure PostgreSQL and MySQL are installed"
echo "5. Have firebase-service-account.json ready"
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# CONFIGURATION - UPDATE THESE VALUES!
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
NETLIFY_TOKEN="YOUR_NETLIFY_TOKEN_HERE"
WSL_HOME="/home/waok"  # Update with your WSL username
WINDOWS_DESKTOP="/mnt/c/Users/wilbe/Desktop"  # Update with your Windows username
FIREBASE_SERVICE_ACCOUNT="$WSL_HOME/firebase-service-account.json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if MCP is already installed
check_mcp() {
    local mcp_name=$1
    if claude mcp list 2>/dev/null | grep -q "$mcp_name"; then
        return 0
    else
        return 1
    fi
}

# Function to install MCP with status
install_mcp() {
    local name=$1
    local command=$2
    
    echo -n "Installing $name... "
    
    if check_mcp "$name"; then
        echo -e "${YELLOW}[ALREADY INSTALLED]${NC}"
        return 0
    fi
    
    if eval "$command" 2>/dev/null; then
        echo -e "${GREEN}[SUCCESS]${NC}"
        return 0
    else
        echo -e "${RED}[FAILED]${NC}"
        return 1
    fi
}

echo ""
echo "Starting MCP installation..."
echo ""

# Install each MCP
install_mcp "context7" "claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest"
install_mcp "filesystem" "claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem \"$WSL_HOME\" \"$WINDOWS_DESKTOP\""
install_mcp "git" "claude mcp add git -s user -- npx -y @cyanheads/git-mcp-server"
install_mcp "github" "claude mcp add github -s user -e GITHUB_PERSONAL_ACCESS_TOKEN=\"$GITHUB_TOKEN\" -- npx -y @modelcontextprotocol/server-github"
install_mcp "sequential-thinking" "claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking"
install_mcp "desktop-commander" "claude mcp add desktop-commander -s user -- npx -y @wonderwhy-er/desktop-commander"
install_mcp "netlify" "claude mcp add netlify -s user -e NETLIFY_PERSONAL_ACCESS_TOKEN=\"$NETLIFY_TOKEN\" -- npx -y @netlify/mcp"
install_mcp "playwright" "claude mcp add playwright -s user -- npx -y @playwright/mcp"

# Check for Firebase service account before installing
if [ -f "$FIREBASE_SERVICE_ACCOUNT" ]; then
    install_mcp "firebase" "claude mcp add firebase -s user -e SERVICE_ACCOUNT_KEY_PATH=\"$FIREBASE_SERVICE_ACCOUNT\" -e FIREBASE_STORAGE_BUCKET=waok-ai-stem.firebasestorage.app -- npx -y @gannonh/firebase-mcp"
else
    echo -e "Installing firebase... ${YELLOW}[SKIPPED - No service account file found at $FIREBASE_SERVICE_ACCOUNT]${NC}"
fi

# Check if PostgreSQL is running before installing
if pg_isready -h localhost -p 5432 2>/dev/null; then
    install_mcp "postgres" "claude mcp add postgres -s user -- npx -y @modelcontextprotocol/server-postgres postgresql://root:@localhost:5432/postgres"
else
    echo -e "Installing postgres... ${YELLOW}[SKIPPED - PostgreSQL not running]${NC}"
fi

# Check if MySQL is running before installing
if mysqladmin ping -h 127.0.0.1 --silent 2>/dev/null; then
    install_mcp "mysql" "claude mcp add mysql -s user -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 -e MYSQL_USER=root -e MYSQL_PASSWORD=\"\" -e MYSQL_DATABASE=mysql -- npx -y mysql-mcp-server"
else
    echo -e "Installing mysql... ${YELLOW}[SKIPPED - MySQL not running]${NC}"
fi

echo ""
echo "=========================================="
echo "Installation Summary"
echo "=========================================="
echo ""

# Show final status
claude mcp list 2>/dev/null || echo "Error: Could not list MCPs. Make sure Claude CLI is installed."

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. If any MCPs failed, check the error messages above"
echo "2. For skipped database MCPs, start the services and re-run this script"
echo "3. For Firebase, ensure you have the service account JSON file"
echo "4. Run 'claude mcp list' to verify all MCPs are connected"
echo ""
echo "To use Claude Code with this project:"
echo "cd \"$WINDOWS_DESKTOP/Trae AI WAOK-Schedule/WAOK-AI-STEM\""
echo "claude --add-dir \"$WINDOWS_DESKTOP/Trae AI WAOK-Schedule/WAOK-AI-STEM\""