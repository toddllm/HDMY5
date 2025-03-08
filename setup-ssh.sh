#!/bin/bash

# Script to set up SSH keys for GitHub access

SSH_DIR="$HOME/.ssh"
SSH_KEY="$SSH_DIR/id_rsa"
SSH_CONFIG="$SSH_DIR/config"

# Create SSH directory if it doesn't exist
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
  echo "Generating new SSH key..."
  ssh-keygen -t rsa -b 4096 -f "$SSH_KEY" -N ""
  
  # Display the public key
  echo ""
  echo "==================================================================="
  echo "New SSH key generated. Add this public key to your GitHub account:"
  echo "==================================================================="
  cat "$SSH_KEY.pub"
  echo "==================================================================="
  echo ""
  echo "To add this key to your GitHub account:"
  echo "1. Go to https://github.com/settings/keys"
  echo "2. Click 'New SSH key'"
  echo "3. Add a title (e.g., 'Game Builder Dev Container')"
  echo "4. Paste the key above"
  echo "5. Click 'Add SSH key'"
  echo ""
else
  echo "SSH key already exists at $SSH_KEY"
fi

# Create or update SSH config
if [ ! -f "$SSH_CONFIG" ]; then
  echo "Creating SSH config..."
  cat > "$SSH_CONFIG" << EOF
Host github.com
  HostName github.com
  User git
  IdentityFile $SSH_KEY
  StrictHostKeyChecking no
EOF
  chmod 600 "$SSH_CONFIG"
else
  echo "SSH config already exists at $SSH_CONFIG"
fi

# Add GitHub to known hosts if not already there
if ! grep -q "github.com" "$SSH_DIR/known_hosts" 2>/dev/null; then
  echo "Adding GitHub to known hosts..."
  ssh-keyscan -t rsa github.com >> "$SSH_DIR/known_hosts"
fi

# Test the connection to GitHub
echo "Testing connection to GitHub..."
ssh -T git@github.com -o StrictHostKeyChecking=no || true

echo ""
echo "SSH setup complete!"
echo "If you see a message like 'Hi username! You've successfully authenticated, but GitHub does not provide shell access.'"
echo "then your SSH key is working correctly with GitHub."
echo ""
echo "If you see 'Permission denied (publickey)', you need to add the public key to your GitHub account." 