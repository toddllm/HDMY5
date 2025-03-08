#!/bin/bash
# setup-custom-domain.sh
#
# This script sets up a custom domain for GitHub Pages using the GitHub CLI.
# It must be run from the root of the repository.
# You must be authenticated with GitHub CLI (`gh auth login`) before running this script.

# Check if a domain was provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 demo.colorworld.live"
    exit 1
fi

DOMAIN="$1"

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

echo "Setting up custom domain '$DOMAIN' for repository: $OWNER/$REPO_NAME"

# Check if GitHub Pages is enabled
echo "Checking if GitHub Pages is enabled..."
PAGES_STATUS=$(gh api \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages 2>&1 || echo "Not available")

if echo "$PAGES_STATUS" | grep -q "Not Found" || echo "$PAGES_STATUS" | grep -q "Not available"; then
    echo "Error: GitHub Pages is not enabled for this repository."
    echo "Please run ./scripts/setup-github-pages.sh first or enable GitHub Pages manually."
    exit 1
fi

# Create CNAME file
echo "Creating CNAME file in the docs directory..."
echo "$DOMAIN" > docs/CNAME

# Configure the custom domain in GitHub
echo "Configuring the custom domain in GitHub..."
DOMAIN_RESPONSE=$(gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO_NAME/pages \
  -f cname="$DOMAIN" 2>&1 || true)

if echo "$DOMAIN_RESPONSE" | grep -q "Not Found"; then
    echo "Warning: Unable to configure the custom domain via API."
    echo "Error details: $DOMAIN_RESPONSE"
    echo ""
    echo "You may need to configure it manually:"
    echo "1. Go to https://github.com/$OWNER/$REPO_NAME/settings/pages"
    echo "2. Under 'Custom domain', enter '$DOMAIN'"
    echo "3. Click 'Save'"
else
    echo "Successfully configured the custom domain in GitHub Pages settings."
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

# Commit and push the CNAME file
echo "Committing and pushing the CNAME file..."
git add docs/CNAME
git commit -m "Add CNAME for custom domain: $DOMAIN"
git push

echo ""
echo "Custom domain setup process completed."
echo "Your site should be available at: https://$DOMAIN/ once DNS is configured correctly."
echo "It may take some time for DNS changes to propagate and for GitHub to provision your SSL certificate."
echo ""
echo "DNS Configuration Instructions:"
echo ""
echo "For an apex domain (e.g., colorworld.live):"
echo "  Create the following A records pointing to GitHub Pages IP addresses:"
echo "    185.199.108.153"
echo "    185.199.109.153"
echo "    185.199.110.153"
echo "    185.199.111.153"
echo ""
echo "For a subdomain (e.g., demo.colorworld.live):"
echo "  Create a CNAME record pointing to '$OWNER.github.io.'"
echo ""
echo "For more information, see GitHub's documentation:"
echo "  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site" 