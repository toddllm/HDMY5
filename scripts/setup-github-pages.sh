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

# First, create the GitHub Pages site
echo "Creating GitHub Pages site with the /docs folder on the main branch..."
CREATE_RESPONSE=$(gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages \
  -f build_type="workflow" \
  -f source='{"branch":"main","path":"/docs"}' 2>&1 || true)

# Check if the create operation succeeded or if the site already exists
if echo "$CREATE_RESPONSE" | grep -q "already exists"; then
    echo "GitHub Pages site already exists. Updating settings..."
elif echo "$CREATE_RESPONSE" | grep -q "Not Found"; then
    echo "Error: Unable to create GitHub Pages site. Make sure you have admin permissions for this repository."
    echo "Error details: $CREATE_RESPONSE"
    echo "Trying to update the site instead..."
else
    echo "Successfully created GitHub Pages site."
fi

# Now update the GitHub Pages settings
echo "Updating GitHub Pages settings..."
UPDATE_RESPONSE=$(gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages \
  -f source='{"branch":"main","path":"/docs"}' 2>&1 || true)

if echo "$UPDATE_RESPONSE" | grep -q "Not Found"; then
    echo "Warning: Unable to update GitHub Pages settings. You may need to configure settings manually."
    echo "Error details: $UPDATE_RESPONSE"
else
    echo "Successfully updated GitHub Pages settings."
fi

# Check GitHub Pages status
echo "Checking GitHub Pages status..."
PAGES_STATUS=$(gh api \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages 2>&1 || echo "Not available")

if echo "$PAGES_STATUS" | grep -q "Not Found" || echo "$PAGES_STATUS" | grep -q "Not available"; then
    echo "GitHub Pages status could not be retrieved."
else
    echo "GitHub Pages status: $PAGES_STATUS"
fi

# Enable HTTPS if possible
echo "Enabling HTTPS for GitHub Pages..."
HTTPS_RESPONSE=$(gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages \
  -f https_enforced=true 2>&1 || true)

if echo "$HTTPS_RESPONSE" | grep -q "Not Found"; then
    echo "Warning: Unable to enable HTTPS. You may need to do this manually once the site is created."
else
    echo "HTTPS has been enabled for your GitHub Pages site."
fi

echo ""
echo "GitHub Pages setup process completed."
echo "Your site should be available at: https://$OWNER.github.io/$REPO_NAME/"
echo "It may take a few minutes for the site to be published."
echo ""
echo "If you encountered errors, you can try setting up GitHub Pages manually:"
echo "1. Go to https://github.com/$OWNER/$REPO_NAME/settings/pages"
echo "2. Under 'Build and deployment', select 'Deploy from a branch'"
echo "3. Select the 'main' branch and the '/docs' folder"
echo "4. Click 'Save'"

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