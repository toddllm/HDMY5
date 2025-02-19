#!/bin/bash

# Function to check if a command was successful
check_error() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

# Function to commit changes
commit_changes() {
    local message="$1"
    local files="${@:2}"  # All arguments after the first one
    
    echo "Staging files: $files"
    git add $files
    check_error "Failed to stage files"
    
    echo "Committing with message: $message"
    git commit -m "$message"
    check_error "Failed to commit changes"
}

# Function to check if working directory is clean
check_working_directory() {
    if [[ -n $(git status -s) ]]; then
        echo "Warning: You have uncommitted changes."
        echo "Current changes:"
        git status -s
        
        read -p "Would you like to continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to create a feature branch
start_feature() {
    local branch_name="$1"
    
    check_working_directory
    
    echo "Creating and switching to feature branch: $branch_name"
    git checkout -b "feature/$branch_name"
    check_error "Failed to create feature branch"
}

# Function to finish a feature
finish_feature() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch =~ ^feature/ ]]; then
        echo "Error: Not on a feature branch"
        exit 1
    fi
    
    echo "Merging feature branch into main"
    git checkout main
    check_error "Failed to checkout main"
    
    git merge "$current_branch"
    check_error "Failed to merge feature branch"
    
    echo "Deleting feature branch"
    git branch -d "$current_branch"
    check_error "Failed to delete feature branch"
}

# Example usage:
# ./dev-workflow.sh start-feature "add-3d-support"
# ./dev-workflow.sh commit "Added basic 3D object types" "src/lib/types/GameTypes.ts"
# ./dev-workflow.sh finish-feature

case "$1" in
    "start-feature")
        start_feature "$2"
        ;;
    "commit")
        commit_changes "$2" "${@:3}"
        ;;
    "finish-feature")
        finish_feature
        ;;
    *)
        echo "Usage:"
        echo "  $0 start-feature <branch-name>"
        echo "  $0 commit <message> [files...]"
        echo "  $0 finish-feature"
        exit 1
        ;;
esac 