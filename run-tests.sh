#!/bin/bash

# Check if server is already running
if ! curl -s http://localhost:5173/ > /dev/null; then
    echo "Starting dev server..."
    # Start server in new terminal window (Mac specific)
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'\" && npm run dev"'
    
    # Wait for server to be ready
    echo "Waiting for server to start..."
    while ! curl -s http://localhost:5173/ > /dev/null; do
        sleep 1
    done
    echo "Server is ready"
fi

# Run the tests
./dev.sh test 