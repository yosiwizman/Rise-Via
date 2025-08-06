#!/bin/bash
# Permanent fix for PR automation
echo "🔧 Restoring PR Automation"

# The issue is repository permissions, not authentication
echo "Root cause: GitHub token lacks repository permissions"
echo "Current permissions: all false (admin, maintain, pull, push, triage)"
echo ""
echo "Required fix: Admin needs to grant repository permissions to devin-ai-integration[bot]"
echo "Permissions needed: push, pull, admin (for autonomous PR creation)"
echo ""
echo "Alternative: Use built-in git_create_pr command which bypasses this limitation"

# Test current status
echo "Testing current GitHub CLI status..."
gh auth status --show-token
echo ""
echo "Testing repository permissions..."
gh api repos/yosiwizman/Rise-Via --jq '.permissions'
