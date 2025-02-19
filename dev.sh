#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command was successful
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: $1${NC}"
        exit 1
    fi
}

# Function to print section header
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to apply changes
apply_changes() {
    local description="$1"
    shift # Remove first argument
    local files=("$@")

    print_header "Applying changes: $description"
    
    # Show files that will be changed
    echo -e "${GREEN}Files to be modified:${NC}"
    for file in "${files[@]}"; do
        echo "  - $file"
    done
    
    # Ask for confirmation
    read -p "Proceed with changes? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Changes aborted${NC}"
        exit 1
    fi

    # Apply changes here (you'll implement the actual change logic)
    echo -e "${GREEN}Changes applied successfully${NC}"
}

# Function to commit changes
commit_changes() {
    local message="$1"
    shift # Remove first argument
    local files=("$@")
    
    print_header "Committing changes"
    
    # Show git status
    git status
    
    # Stage specified files
    for file in "${files[@]}"; do
        echo -e "\n${GREEN}Staging: $file${NC}"
        git add "$file"
        check_error "Failed to stage $file"
    done
    
    # Commit
    echo -e "\n${GREEN}Committing with message: $message${NC}"
    git commit -m "$message"
    check_error "Failed to commit changes"
}

# Function to start a feature
start_feature() {
    local name="$1"
    print_header "Starting feature: $name"
    
    git checkout -b "feature/$name"
    check_error "Failed to create feature branch"
    
    echo -e "${GREEN}Created and switched to feature/$name${NC}"
}

# Function to finish a feature
finish_feature() {
    print_header "Finishing feature"
    
    local current_branch=$(git branch --show-current)
    if [[ ! $current_branch =~ ^feature/ ]]; then
        echo -e "${RED}Error: Not on a feature branch${NC}"
        exit 1
    fi
    
    git checkout main
    check_error "Failed to checkout main"
    
    git merge "$current_branch"
    check_error "Failed to merge feature branch"
    
    git branch -d "$current_branch"
    check_error "Failed to delete feature branch"
    
    echo -e "${GREEN}Feature completed and merged to main${NC}"
}

# Main command handler
case "$1" in
    "start")
        start_feature "$2"
        ;;
    "commit")
        commit_changes "$2" "${@:3}"
        ;;
    "finish")
        finish_feature
        ;;
    "apply")
        apply_changes "$2" "${@:3}"
        ;;
    *)
        echo "Usage:"
        echo "  $0 start <feature-name>"
        echo "  $0 apply <description> [files...]"
        echo "  $0 commit <message> [files...]"
        echo "  $0 finish"
        exit 1
        ;;
esac 