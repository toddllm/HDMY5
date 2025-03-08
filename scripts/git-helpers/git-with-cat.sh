#!/bin/bash
# git-with-cat.sh
#
# This script runs git commands with GIT_PAGER set to 'cat' to ensure
# consistent output formatting without pagination.
#
# Usage: ./scripts/git-helpers/git-with-cat.sh <git-command> [arguments]
# Example: ./scripts/git-helpers/git-with-cat.sh log -n 5 --oneline

# Set the GIT_PAGER environment variable to 'cat'
export GIT_PAGER=cat

# Check if a command was provided
if [ $# -eq 0 ]; then
  echo "Error: No git command specified."
  echo "Usage: $0 <git-command> [arguments]"
  echo "Example: $0 log -n 5 --oneline"
  exit 1
fi

# Run the git command with all arguments
git "$@" 