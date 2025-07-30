# MCP Requirements for WAOK-AI-STEM Project

This file documents all required MCP (Model Context Protocol) servers for the project.
Claude should use this file to verify and install missing MCPs automatically.

## System Requirements

- **Operating System**: Windows 11 with WSL Ubuntu 20.04
- **Node.js**: v20+ (installed via NVM recommended)
- **Claude Code CLI**: Installed globally
- **WSL Home Directory**: `/home/waok` (adjust for your system)
- **Windows Project Directory**: `/mnt/c/Users/wilbe/Desktop`

## Required MCP Servers

### 1. Context7 - Library Documentation
```bash
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
```
- **Purpose**: Access up-to-date documentation for any library
- **Features**: React, Vue, Python, Node.js documentation
- **No configuration required**

### 2. Filesystem - File Access
```bash
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem /home/waok "/mnt/c/Users/wilbe/Desktop"
```
- **Purpose**: Read/write files across WSL and Windows
- **Paths**: Adjust paths based on your system:
  - WSL home: `/home/YOUR_USERNAME`
  - Windows Desktop: `/mnt/c/Users/YOUR_WINDOWS_USERNAME/Desktop`

### 3. Git - Version Control
```bash
claude mcp add git -s user -- npx -y @cyanheads/git-mcp-server
```
- **Purpose**: Git operations (commit, branch, merge, etc.)
- **Works with**: Any git repository
- **No configuration required**

### 4. GitHub - Repository Management
```bash
claude mcp add github -s user -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN_HERE -- npx -y @modelcontextprotocol/server-github
```
- **Purpose**: GitHub API operations
- **Required Token**: Create at https://github.com/settings/tokens
- **Permissions needed**: repo, workflow, read:org

### 5. Sequential Thinking - Problem Solving
```bash
claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking
```
- **Purpose**: Break down complex problems into steps
- **Use for**: Multi-step reasoning, planning
- **No configuration required**

### 6. Desktop Commander - System Control
```bash
claude mcp add desktop-commander -s user -- npx -y @wonderwhy-er/desktop-commander
```
- **Purpose**: Desktop automation, screenshots, system control
- **Features**: Window management, process control, file operations
- **No configuration required**

### 7. Netlify - Deployment
```bash
claude mcp add netlify -s user -e NETLIFY_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN_HERE -- npx -y @netlify/mcp
```
- **Purpose**: Deploy to Netlify, manage sites
- **Required Token**: Create at https://app.netlify.com/user/applications#personal-access-tokens
- **Project Site ID**: 44dfe813-0fd0-4097-9841-73ed7b0c07b7

### 8. Playwright - Browser Automation
```bash
claude mcp add playwright -s user -- npx -y @playwright/mcp
```
- **Purpose**: Web scraping, E2E testing, browser automation
- **Features**: Multi-browser support, screenshots, interactions
- **No configuration required**

### 9. Firebase - Backend Services
```bash
claude mcp add firebase -s user -e SERVICE_ACCOUNT_KEY_PATH=/home/waok/firebase-service-account.json -e FIREBASE_STORAGE_BUCKET=waok-ai-stem.firebasestorage.app -- npx -y @gannonh/firebase-mcp
```
- **Purpose**: Firebase operations (Firestore, Storage, Auth)
- **Required**: Service account JSON file
- **How to get service account**:
  1. Go to Firebase Console
  2. Project Settings → Service Accounts
  3. Generate New Private Key
  4. Save as: `/home/waok/firebase-service-account.json`

### 10. PostgreSQL - Database
```bash
# First install PostgreSQL in WSL:
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER root WITH SUPERUSER CREATEDB CREATEROLE PASSWORD '';"

# Then add MCP:
claude mcp add postgres -s user -- npx -y @modelcontextprotocol/server-postgres postgresql://root:@localhost:5432/postgres
```
- **Purpose**: PostgreSQL database operations
- **Default connection**: `postgresql://root:@localhost:5432/postgres`
- **Note**: Adjust connection string as needed

### 11. MySQL - Database
```bash
# First install MySQL in WSL:
sudo apt update && sudo apt install mysql-server
sudo service mysql start
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ''; FLUSH PRIVILEGES;"

# Then add MCP:
claude mcp add mysql -s user -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 -e MYSQL_USER=root -e MYSQL_PASSWORD="" -e MYSQL_DATABASE=mysql -- npx -y mysql-mcp-server
```
- **Purpose**: MySQL database operations
- **Default connection**: root user, no password
- **Host**: 127.0.0.1 (not localhost)

## Installation Script

Save this as `install-mcps.sh` and run with `bash install-mcps.sh`:

```bash
#!/bin/bash
# WAOK-AI-STEM MCP Installation Script

echo "Installing MCPs for WAOK-AI-STEM project..."
echo "Make sure you have updated the tokens in this script!"
echo ""

# IMPORTANT: Update these values
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
NETLIFY_TOKEN="YOUR_NETLIFY_TOKEN_HERE"
WSL_HOME="/home/waok"  # Update with your WSL username
WINDOWS_DESKTOP="/mnt/c/Users/wilbe/Desktop"  # Update with your Windows username

# Install MCPs
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem "$WSL_HOME" "$WINDOWS_DESKTOP"
claude mcp add git -s user -- npx -y @cyanheads/git-mcp-server
claude mcp add github -s user -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" -- npx -y @modelcontextprotocol/server-github
claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add desktop-commander -s user -- npx -y @wonderwhy-er/desktop-commander
claude mcp add netlify -s user -e NETLIFY_PERSONAL_ACCESS_TOKEN="$NETLIFY_TOKEN" -- npx -y @netlify/mcp
claude mcp add playwright -s user -- npx -y @playwright/mcp
claude mcp add firebase -s user -e SERVICE_ACCOUNT_KEY_PATH="$WSL_HOME/firebase-service-account.json" -e FIREBASE_STORAGE_BUCKET=waok-ai-stem.firebasestorage.app -- npx -y @gannonh/firebase-mcp
claude mcp add postgres -s user -- npx -y @modelcontextprotocol/server-postgres postgresql://root:@localhost:5432/postgres
claude mcp add mysql -s user -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 -e MYSQL_USER=root -e MYSQL_PASSWORD="" -e MYSQL_DATABASE=mysql -- npx -y mysql-mcp-server

echo ""
echo "Installation complete! Run 'claude mcp list' to verify."
```

## Verification

After installation, verify all MCPs are connected:

```bash
claude mcp list
```

Expected output:
```
✓ context7: Connected
✓ filesystem: Connected
✓ git: Connected
✓ github: Connected
✓ sequential-thinking: Connected
✓ desktop-commander: Connected
✓ netlify: Connected
✓ playwright: Connected
✓ firebase: Connected
✓ postgres: Connected
✓ mysql: Connected
```

## Troubleshooting

1. **MCP not connecting**: Check if required services are running (PostgreSQL, MySQL)
2. **Token errors**: Verify tokens are valid and have correct permissions
3. **Path errors**: Adjust paths for your specific system
4. **Database errors**: Ensure databases are installed and running in WSL

## Project-Specific Usage

For WAOK-AI-STEM project, when starting Claude Code:

```bash
# From Windows/WSL terminal
cd "/mnt/c/Users/wilbe/Desktop/Trae AI WAOK-Schedule/WAOK-AI-STEM"
claude --add-dir "/mnt/c/Users/wilbe/Desktop/Trae AI WAOK-Schedule/WAOK-AI-STEM"
```

The `--add-dir` flag is required for directories outside WSL home.

## Security Notes

- **Never commit tokens** to the repository
- Store `firebase-service-account.json` securely
- Use environment variables or secure vaults for production
- Rotate tokens regularly

Last updated: July 30, 2025