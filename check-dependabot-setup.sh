#!/bin/bash

echo "🔍 Checking Dependabot Auto-Approval Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

echo "📁 Checking workflow files..."

# Check for main workflow
if [ -f ".github/workflows/dependabot-auto-merge.yml" ]; then
    echo -e "${GREEN}✓ Found dependabot-auto-merge.yml${NC}"
    
    # Check if it uses PAT
    if grep -q "DEPENDABOT_AUTO_APPROVE_PAT" ".github/workflows/dependabot-auto-merge.yml"; then
        echo -e "${YELLOW}⚠️  Workflow uses PAT (DEPENDABOT_AUTO_APPROVE_PAT) - make sure it's configured in repository secrets${NC}"
    elif grep -q "pull_request_target" ".github/workflows/dependabot-auto-merge.yml"; then
        echo -e "${GREEN}✓ Workflow uses pull_request_target event${NC}"
    else
        echo -e "${RED}❌ Workflow might still be using regular GITHUB_TOKEN for approval${NC}"
    fi
else
    echo -e "${RED}❌ dependabot-auto-merge.yml not found${NC}"
fi

# Check for alternative workflow
if [ -f ".github/workflows/dependabot-auto-merge-alternative.yml" ]; then
    echo -e "${YELLOW}ℹ️  Found alternative workflow (dependabot-auto-merge-alternative.yml)${NC}"
fi

echo ""
echo "📋 Checking Dependabot configuration..."

# Check for dependabot.yml
if [ -f ".github/dependabot.yml" ]; then
    echo -e "${GREEN}✓ Found dependabot.yml${NC}"
    
    # Count configured ecosystems
    ecosystems=$(grep -c "package-ecosystem:" ".github/dependabot.yml")
    echo -e "  📦 Configured for $ecosystems package ecosystem(s)"
else
    echo -e "${RED}❌ dependabot.yml not found${NC}"
fi

echo ""
echo "📝 Next steps:"
echo ""

if grep -q "DEPENDABOT_AUTO_APPROVE_PAT" ".github/workflows/dependabot-auto-merge.yml" 2>/dev/null; then
    echo "1. Create a Personal Access Token (PAT) with 'repo' scope"
    echo "2. Add it as a repository secret named 'DEPENDABOT_AUTO_APPROVE_PAT'"
    echo "3. Enable auto-merge in repository settings (Settings → General → Pull Requests → Allow auto-merge)"
    echo "4. Configure branch protection rules if needed"
else
    echo "1. Enable auto-merge in repository settings (Settings → General → Pull Requests → Allow auto-merge)"
    echo "2. Configure branch protection rules if needed"
fi

echo ""
echo "📚 Full documentation: DEPENDABOT_AUTO_APPROVAL_SETUP.md"