# Update Documentation Slash Command

This command automatically updates all README files, documentation, and CLAUDE.md based on recent code changes.

## Usage
```
/update-docs
```

## What it does

1. **Analyzes Recent Changes**
   - Checks git diff for all modified files
   - Identifies code changes that affect documentation
   - Detects new features, API changes, and architectural updates

2. **Updates Documentation Files**
   - `README.md` - Project overview, setup instructions, features
   - `CLAUDE.md` - Development guidelines, architecture notes, command references
   - `DEPLOYMENT_SUMMARY.md` - Deployment configuration and status
   - `AI-ROADMAP.md` - Updates based on implemented features
   - Other `.md` files in `/docs` directory

3. **Smart Updates**
   - Preserves existing structure and formatting
   - Only updates sections affected by code changes
   - Adds new sections for new features
   - Updates command lists, API endpoints, and configuration examples
   - Maintains consistent tone and style

4. **Code Analysis**
   - Scans for new dependencies in package.json
   - Identifies new API routes or functions
   - Detects configuration changes
   - Finds new components or modules
   - Updates architecture diagrams references

## Implementation

```bash
# First, analyze all recent changes
git diff --name-only HEAD~1

# For each changed file, determine impact on documentation
# Update relevant sections in documentation files
# Ensure all examples and code snippets are current
# Update version numbers and dates where applicable
```

## Documentation Update Rules

### README.md Updates
- Installation steps when package.json changes
- Feature list when new components are added
- API documentation when endpoints change
- Configuration when environment variables are added

### CLAUDE.md Updates
- Essential commands when package.json scripts change
- Architecture overview when new directories/patterns are introduced
- Development notes when new tools or dependencies are added
- Deployment information when deployment configs change

### Other Documentation
- Migration guides when breaking changes occur
- API documentation when endpoints are modified
- Configuration guides when settings change
- Troubleshooting sections when common issues are resolved

## Example Workflow

1. Developer makes code changes
2. Developer runs `/update-docs`
3. Command analyzes changes and updates all relevant documentation
4. Developer reviews updates and commits

This ensures documentation always stays in sync with the codebase!