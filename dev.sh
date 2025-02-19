# Enable debug output
set -x

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

# Function to wait for server
wait_for_server() {
    local logfile="server_check.log"
    echo "Waiting for server to be ready... (logging to $logfile)"
    local max_attempts=30
    local attempt=1
    
    # Clear previous log
    > "$logfile"
    
    while [ $attempt -le $max_attempts ]; do
        {
            echo "=== Attempt $attempt ==="
            echo "Checking http://localhost:5173/"
            curl -v http://localhost:5173/ 2>&1
            echo "===================="
            echo
        } >> "$logfile"
        
        if grep -q "200 OK" "$logfile"; then
            echo "Server is ready!"
            return 0
        fi
        echo "Attempt $attempt of $max_attempts - Server not ready yet..."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo "Server failed to start after $max_attempts attempts"
    echo "Check $logfile for details"
    return 1
}

run_tests() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local screenshot_dir="test_screenshots/${timestamp}"
    
    echo "Creating screenshot directory: ${screenshot_dir}"
    mkdir -p "${screenshot_dir}"
    
    echo "Starting dev server..."
    npm run dev &
    local dev_server_pid=$!
    
    echo "Waiting 5 seconds for server startup..."
    sleep 5
    
    echo "Running single test for debugging..."
    npx playwright test -g "should create a new scene" --headed \
        --trace on \
        --output="${screenshot_dir}"
    local test_result=$?
    
    echo "Shutting down dev server..."
    pkill -P $dev_server_pid 2>/dev/null
    kill $dev_server_pid 2>/dev/null
    
    # Keep only the 3 most recent screenshot directories
    ls -t test_screenshots | tail -n +4 | xargs -I {} rm -rf "test_screenshots/{}"
    
    # Launch the report viewer in the background
    echo "Opening test report..."
    nohup npx playwright show-report > /dev/null 2>&1 & disown
    
    return $test_result
}

# Main command handler
case "$1" in
    "test")
        echo "Starting test command..."
        run_tests
        echo "Test command completed with status: $?"
        ;;
    "commit")
        message="$2"
        shift 2
        echo "Committing changes with message: $message"
        for file in "$@"; do
            git add "$file"
        done
        git commit -m "$message"
        ;;
    "start")
        start_feature "$2"
        ;;
    *)
        echo "Usage:"
        echo "  $0 test"
        echo "  $0 commit <message> [files...]"
        echo "  $0 start <feature-name>"
        exit 1
        ;;
esac 