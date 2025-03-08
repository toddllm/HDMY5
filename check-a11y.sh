#!/bin/bash

# Script to check for accessibility issues in Svelte components

echo "Checking for accessibility issues in Svelte components..."

# Find all Svelte files
SVELTE_FILES=$(find src -name "*.svelte")

# Initialize counters
TOTAL_ISSUES=0
FILES_WITH_ISSUES=0

# Check each file for accessibility issues
for FILE in $SVELTE_FILES; do
  FILE_ISSUES=0
  
  # Check for click events without keyboard events
  CLICK_WITHOUT_KEY=$(grep -c "on:click" "$FILE" | grep -v "on:keydown\|on:keypress\|on:keyup" || true)
  if [ "$CLICK_WITHOUT_KEY" -gt 0 ]; then
    echo "Found potential click events without keyboard events in $FILE"
    FILE_ISSUES=$((FILE_ISSUES + CLICK_WITHOUT_KEY))
  fi
  
  # Check for div elements with click handlers
  DIV_WITH_CLICK=$(grep -c "<div.*on:click" "$FILE" || true)
  if [ "$DIV_WITH_CLICK" -gt 0 ]; then
    echo "Found $DIV_WITH_CLICK div elements with click handlers in $FILE"
    FILE_ISSUES=$((FILE_ISSUES + DIV_WITH_CLICK))
  fi
  
  # Check for labels without associated controls
  LABELS_WITHOUT_FOR=$(grep -c "<label[^>]*>[^<]*</label>" "$FILE" | grep -v "for=" || true)
  if [ "$LABELS_WITHOUT_FOR" -gt 0 ]; then
    echo "Found $LABELS_WITHOUT_FOR labels without 'for' attribute in $FILE"
    FILE_ISSUES=$((FILE_ISSUES + LABELS_WITHOUT_FOR))
  fi
  
  if [ "$FILE_ISSUES" -gt 0 ]; then
    FILES_WITH_ISSUES=$((FILES_WITH_ISSUES + 1))
    TOTAL_ISSUES=$((TOTAL_ISSUES + FILE_ISSUES))
  fi
done

# Let's also check the specific components mentioned in the Vite warnings
SPECIFIC_FILES=(
  "src/routes/+page.svelte"
  "src/lib/components/ObjectCreationDialog.svelte"
  "src/lib/components/EntityCreationDialog.svelte"
)

for FILE in "${SPECIFIC_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Checking specific file: $FILE"
    grep -n "<div.*on:click" "$FILE" || true
    grep -n "<label[^>]*>[^<]*</label>" "$FILE" | grep -v "for=" || true
  fi
done

echo "------------------------------"
echo "Accessibility Check Summary:"
echo "------------------------------"
echo "Total potential issues found: $TOTAL_ISSUES"
echo "Files with potential issues: $FILES_WITH_ISSUES"
echo "Total Svelte files: $(echo "$SVELTE_FILES" | wc -l)"

echo "Note: This is a basic check and may not catch all issues."
echo "Please review the Vite warnings for more accurate information."

if [ "$TOTAL_ISSUES" -gt 0 ]; then
  echo "Please fix the accessibility issues before committing."
  exit 1
else
  echo "No obvious accessibility issues found, but please check Vite warnings."
  exit 0
fi 