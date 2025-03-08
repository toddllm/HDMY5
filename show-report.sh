#!/bin/bash

# Check if the playwright-report directory exists
if [ ! -d "playwright-report" ]; then
  echo "Error: playwright-report directory not found."
  echo "Run tests first to generate a report."
  exit 1
fi

# Kill any existing report server
pkill -f "playwright show-report" || true

# Start the report server on all interfaces
echo "Starting Playwright report server on http://0.0.0.0:9323"
echo "You can access it from your host machine at http://localhost:9323"
echo "Press Ctrl+C to stop the server."

# Use a custom command to bind to all interfaces
cd playwright-report && npx --yes http-server -p 9323 --cors -a 0.0.0.0 