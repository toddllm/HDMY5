#!/bin/bash

# Check if http-server is installed
if ! command -v npx http-server &> /dev/null; then
    echo "http-server is not installed. Installing..."
    npm install -g http-server
fi

# Kill any existing http-server processes
echo "Killing any existing http-server processes..."
pkill -f "http-server" || true

# Start the development server for the actual demo
echo "Starting development server for the voxel demo..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Start the http-server for the demo page
echo "Starting http-server for the demo page..."
cd demos
npx http-server -p 8080 &
HTTP_SERVER_PID=$!

echo "Demo page is available at http://localhost:8080/voxel-engine/"
echo "The actual voxel demo is available at http://localhost:5173/voxel-demo"
echo "Press Ctrl+C to stop the servers."

# Set up trap to clean up on exit
function cleanup {
    echo "Cleaning up processes..."
    
    # Kill the development server
    if [ ! -z "$DEV_PID" ]; then
        echo "Stopping development server (PID: $DEV_PID)"
        kill $DEV_PID 2>/dev/null || true
    fi
    
    # Kill the HTTP server
    if [ ! -z "$HTTP_SERVER_PID" ]; then
        echo "Stopping HTTP server (PID: $HTTP_SERVER_PID)"
        kill $HTTP_SERVER_PID 2>/dev/null || true
    fi
    
    echo "Cleanup complete."
}

trap cleanup EXIT INT TERM

# Wait for user to press Ctrl+C
wait 