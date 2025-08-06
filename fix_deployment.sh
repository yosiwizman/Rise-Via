#!/bin/bash
# Future deployment fix script for Rise-Via
echo "🔧 Deployment Fix Script for Rise-Via"
echo "====================================="

# Reset authentication if needed
echo "1. Resetting authentication..."
gh auth logout 2>/dev/null || true
vercel logout 2>/dev/null || true

# Re-authenticate
echo "2. Re-authenticating..."
gh auth login --web --git-protocol https
vercel login

# Test authentication
echo "3. Testing authentication..."
gh auth status
vercel whoami

# Create PR manually if automated methods fail
echo "4. Manual PR creation URL:"
BRANCH=$(git branch --show-current)
echo "https://github.com/yosiwizman/Rise-Via/compare/main...$BRANCH?quick_pull=1"

# Deploy with token if available
echo "5. Deploying..."
if [ -n "$risevia_deploy_token" ]; then
    vercel --prod --token "$risevia_deploy_token" --yes
else
    vercel --prod
fi

echo "✅ Deployment process complete"
