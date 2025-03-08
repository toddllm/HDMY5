#!/bin/bash
# Script to set up Git pushing capabilities using the best available method

set -e  # Exit on error

echo "Setting up Git push capabilities..."

# Check if we're in a git repository
if [ ! -d .git ]; then
  echo "Error: Not in a Git repository"
  exit 1
fi

# Get repository info
REMOTE_URL=$(git remote get-url origin)
REPO_NAME=$(echo "$REMOTE_URL" | sed -n 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/p' | sed 's/\.git$//')

# Function to test pushing capability
test_push() {
  echo "Testing push capability..."
  # Create a temporary branch to test pushing
  git branch -D test_push_capability 2>/dev/null || true
  git checkout -b test_push_capability
  git checkout main
  # Try pushing the branch
  if git push --dry-run origin test_push_capability 2>/dev/null; then
    echo "✅ Push capability confirmed!"
    git branch -D test_push_capability 2>/dev/null || true
    return 0
  else
    git branch -D test_push_capability 2>/dev/null || true
    return 1
  fi
}

# Function to get or request GitHub token
get_github_token() {
  if [ -n "$GH_TOKEN" ]; then
    echo "Using GH_TOKEN from environment variables"
    return 0
  elif [ -n "$GITHUB_TOKEN" ]; then
    export GH_TOKEN="$GITHUB_TOKEN"
    echo "Using GITHUB_TOKEN from environment variables"
    return 0
  else
    # Create a URL with specific scopes for the token
    TOKEN_URL="https://github.com/settings/tokens/new?description=HDMY5%20Game%20Builder%20$(date +%Y-%m-%d)&scopes=repo,workflow,read:org"
    
    echo ""
    echo "===================================================================="
    echo "No GitHub token found. Please follow these steps:"
    echo ""
    echo "1. Open this URL in your browser:"
    echo "   $TOKEN_URL"
    echo ""
    echo "2. You'll see a pre-configured token request with the needed permissions"
    echo "3. Click 'Generate token' at the bottom of the page"
    echo "4. Copy the generated token"
    echo "===================================================================="
    echo ""
    echo -n "Paste your token here and press Enter: "
    read -r GH_TOKEN
    
    if [ -n "$GH_TOKEN" ]; then
      echo "Token received."
      return 0
    else
      echo "No token provided."
      return 1
    fi
  fi
}

# Check if we already have push capability
if test_push; then
  echo "Already able to push to remote repository"
  exit 0
fi

# Method 1: Try GitHub CLI auth if available
if command -v gh &>/dev/null; then
  echo "GitHub CLI is installed, attempting authentication..."
  
  # Check if already authenticated
  if gh auth status &>/dev/null; then
    echo "Already authenticated with GitHub CLI"
  else
    # Get token through our simplified method
    if get_github_token; then
      echo "Authenticating with GitHub CLI using token..."
      echo "$GH_TOKEN" | gh auth login --with-token
      
      # Configure git to use the token
      git config --global credential.helper store
      echo "https://oauth2:$GH_TOKEN@github.com" > ~/.git-credentials
      chmod 600 ~/.git-credentials
    else
      echo "Failed to get GitHub token."
      exit 1
    fi
  fi
  
  # Test again after GitHub CLI auth
  if test_push; then
    exit 0
  fi
fi

# Method 2: Try SSH setup
echo "Setting up SSH keys..."
./setup-ssh.sh

# Test again after SSH setup
if test_push; then
  exit 0
fi

# Method 3: Try HTTPS with credential helper
echo "Setting up HTTPS with credential helper..."

# Configure git to use HTTPS instead of SSH
git config --global credential.helper store
git config --global url."https://github.com/".insteadOf "git@github.com:"

if get_github_token; then
  # Store the GitHub token for HTTPS authentication
  echo "https://oauth2:$GH_TOKEN@github.com" > ~/.git-credentials
  chmod 600 ~/.git-credentials
  
  # Test again after HTTPS setup
  if test_push; then
    exit 0
  fi
fi

# If all methods failed
echo "❌ Failed to set up Git push capabilities"
echo "Please try one of the following:"
echo "1. Add your SSH key to GitHub: https://github.com/settings/keys"
echo "2. Set the GH_TOKEN environment variable with a personal access token"
echo "3. Authenticate manually with 'gh auth login'"
exit 1 