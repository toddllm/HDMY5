#!/bin/bash

# Simplified script to run Playwright end-to-end tests

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

# Create reports directory if it doesn't exist
mkdir -p test-reports

# Run the simplified test in headless mode with report generation
echo "Running simplified Playwright test in headless mode..."
npx playwright test tests/simple-test.spec.ts --project=chromium --timeout=30000 --reporter=html,list

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
echo "Report: HTML report saved to playwright-report/"
echo "Screenshots saved to project root"
echo "========================================"

# Clean up the dev server if we started it
if [ -n "$DEV_SERVER_PID" ]; then
  echo "Stopping dev server..."
  kill $DEV_SERVER_PID 2>/dev/null
fi

# Exit with the test exit code
exit $TEST_EXIT_CODE 