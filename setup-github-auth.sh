#!/bin/bash

# Script to set up GitHub authentication automatically

# Check if GH_TOKEN environment variable is set
if [ -z "$GH_TOKEN" ]; then
  echo "GH_TOKEN environment variable is not set."
  echo "You need to provide a GitHub Personal Access Token to authenticate automatically."
  echo ""
  echo "To create a token:"
  echo "1. Go to https://github.com/settings/tokens"
  echo "2. Click 'Generate new token' (classic)"
  echo "3. Give it a name and select the 'repo' and 'read:org' scopes"
  echo "4. Copy the token"
  echo ""
  echo "Then, you can either:"
  echo "a) Run this script with the token: GH_TOKEN=your_token ./setup-github-auth.sh"
  echo "b) Add the token to your devcontainer.json as an environment variable:"
  echo "   \"runArgs\": [\"-e\", \"GH_TOKEN=your_token\", \"-e\", \"DISPLAY=host.docker.internal:0\"],"
  echo ""
  exit 1
fi

# Authenticate with GitHub CLI using the token
echo "Authenticating with GitHub CLI..."
echo "$GH_TOKEN" | gh auth login --with-token

# Verify authentication
echo "Verifying GitHub authentication..."
gh auth status

# Configure Git to use HTTPS instead of SSH
echo "Configuring Git to use HTTPS with credential helper..."
git config --global credential.helper store
git config --global url."https://github.com/".insteadOf "git@github.com:"

# Store the GitHub token for HTTPS authentication
echo "https://oauth2:$GH_TOKEN@github.com" > ~/.git-credentials
chmod 600 ~/.git-credentials

echo ""
echo "GitHub authentication setup complete!"
echo "You can now use Git commands with HTTPS authentication." 