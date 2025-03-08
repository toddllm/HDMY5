#!/bin/bash
# setup-github-pages.sh
#
# This script sets up GitHub Pages for the repository using the GitHub CLI.
# It must be run from the root of the repository.
# You must be authenticated with GitHub CLI (`gh auth login`) before running this script.

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI is not installed. Please install it first:"
    echo "  https://cli.github.com/manual/installation"
    exit 1
fi

# Check if the user is authenticated
AUTH_STATUS=$(gh auth status 2>&1 || true)
if echo "$AUTH_STATUS" | grep -q "You are not logged into any GitHub hosts"; then
    echo "Error: You are not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Get repository information
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename -s .git "$REPO_URL")
OWNER=$(echo "$REPO_URL" | sed -n 's/.*github.com[:/]\(.*\)\/'"$REPO_NAME"'.*/\1/p')

echo "Setting up GitHub Pages for repository: $OWNER/$REPO_NAME"

# Enable GitHub Pages with the docs folder
echo "Enabling GitHub Pages with the /docs folder on the main branch..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages \
  -f source='{"branch":"main","path":"/docs"}'

# Check GitHub Pages status
echo "Checking GitHub Pages status..."
PAGES_STATUS=$(gh api \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages)

echo "GitHub Pages status: $PAGES_STATUS"

# Enable HTTPS (recommended)
echo "Enabling HTTPS for GitHub Pages..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages \
  -f https_enforced=true

echo "GitHub Pages has been set up successfully!"
echo "Your site will be available at: https://$OWNER.github.io/$REPO_NAME/"
echo "It may take a few minutes for the site to be published."

# Instructions for setting up a custom domain (optional)
echo ""
echo "To set up a custom domain (optional):"
echo "1. Create a CNAME file in the docs directory:"
echo "   echo \"yourdomain.com\" > docs/CNAME"
echo "   git add docs/CNAME"
echo "   git commit -m \"Add CNAME for custom domain\""
echo "   git push"
echo ""
echo "2. Configure the custom domain in GitHub:"
echo "   gh api \\"
echo "     --method PUT \\"
echo "     -H \"Accept: application/vnd.github+json\" \\"
echo "     /repos/$OWNER/$REPO_NAME/pages \\"
echo "     -f cname='yourdomain.com'"
echo ""
echo "3. Update your DNS settings according to GitHub documentation:"
echo "   https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site" 