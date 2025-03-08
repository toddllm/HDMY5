#!/bin/bash
# setup-git-aliases.sh
#
# This script sets up Git aliases that use 'cat' as the pager
# for consistent output formatting without pagination.
#
# Usage: ./scripts/git-helpers/setup-git-aliases.sh

# Set up Git aliases
git config --global alias.catlog 'log --color=always | cat'
git config --global alias.catdiff 'diff --color=always | cat'
git config --global alias.catshow 'show --color=always | cat'
git config --global alias.catstatus 'status --color=always | cat'
git config --global alias.catblame 'blame --color=always | cat'

echo "Git aliases have been set up successfully!"
echo "You can now use the following commands:"
echo "  git catlog    - Show commit logs with cat pager"
echo "  git catdiff   - Show diffs with cat pager"
echo "  git catshow   - Show various Git objects with cat pager"
echo "  git catstatus - Show repository status with cat pager"
echo "  git catblame  - Show file blame information with cat pager" 