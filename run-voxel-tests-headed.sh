#!/bin/bash

# Script to run voxel engine tests in headed mode (requires X11 forwarding)

# Check if DISPLAY is set
if [ -z "$DISPLAY" ]; then
  echo "Error: DISPLAY environment variable is not set."
  echo "X11 forwarding is required to run tests in headed mode."
  echo "Please make sure X11 forwarding is enabled in your SSH connection or dev container setup."
  echo ""
  echo "If you're using VS Code Remote Containers, you may need to:"
  echo "1. Install an X server on your host machine (like VcXsrv on Windows or XQuartz on macOS)"
  echo "2. Configure your devcontainer.json to enable X11 forwarding"
  echo ""
  echo "Alternatively, you can run the tests in headless mode with:"
  echo "  ./run-voxel-tests.sh"
  exit 1
fi

# Ensure the dev server is running
if ! curl -s http://localhost:5173 > /dev/null; then
  echo "Starting dev server..."
  npm run dev &
  DEV_SERVER_PID=$!
  
  # Wait for the dev server to start
  echo "Waiting for dev server to start..."
  for i in {1..10}; do
    if curl -s http://localhost:5173 > /dev/null; then
      echo "Dev server started successfully."
      break
    fi
    
    sleep 1
  done
else
  echo "Dev server is already running."
  DEV_SERVER_PID=""
fi

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Run the voxel engine tests in headed mode with slow motion
echo "Running voxel engine tests in headed mode..."
echo "You should see a browser window open. If not, check your X11 forwarding setup."

# Set a longer timeout and slower execution for better visibility
export PWDEBUG=1
npx playwright test tests/voxel-engine.spec.ts --project=chromium --headed --timeout=60000

TEST_EXIT_CODE=$?

# Display test results summary
echo ""
echo "========================================"
echo "Test Results Summary"
echo "========================================"
echo "Exit Code: $TEST_EXIT_CODE"
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "Status: ✅ PASSED"
else
  echo "Status: ❌ FAILED"
fi
echo "Screenshots saved to project root"
echo "========================================"

# Clean up the dev server if we started it
if [ -n "$DEV_SERVER_PID" ]; then
  echo "Stopping dev server..."
  kill $DEV_SERVER_PID 2>/dev/null
fi

# Exit with the test exit code
exit $TEST_EXIT_CODE 