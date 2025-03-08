#!/bin/bash
# setup-genz-git-aliases.sh
#
# This script sets up Gen Z-themed Git aliases with culturally accurate mappings
# that use 'cat' as the pager for consistent output formatting.
#
# Usage: ./scripts/git-helpers/setup-genz-git-aliases.sh

# Set up Gen Z Git aliases
git config --global alias.vibes 'status --color=always | cat'  # Check the vibe
git config --global alias.slay 'add'                           # Adding files is slaying it
git config --global alias.bet 'commit'                         # Bet on your changes
git config --global alias.yeet 'push'                          # Throw it to remote
git config --global alias.sus 'diff --color=always | cat'      # What's sus about these changes?
git config --global alias.nocap 'log --color=always | cat'     # The real history, no cap
git config --global alias.fr 'pull'                            # For real, get latest changes

echo "✨ Gen Z Git aliases have been set up successfully! ✨"
echo ""
echo "🔥 You can now use the following commands: 🔥"
echo "  git vibes   - Check status (what's the vibe of your repo)"
echo "  git slay    - Add files (slay that staging area)"
echo "  git bet     - Commit changes (bet these changes are fire)"
echo "  git yeet    - Push changes (yeet your code to the remote)"
echo "  git sus     - View differences (find what's sus in your code)"
echo "  git nocap   - Show commit history (the real history, no cap)"
echo "  git fr      - Pull changes (for real, get the latest code)"
echo ""
echo "💯 These aliases are actually bussin', fr fr 💯" 