#!/bin/bash

# Create directories
mkdir -p demos/voxel-engine/screenshots
mkdir -p demos/voxel-engine/videos

# Kill any existing processes
echo "Killing any existing processes..."
pkill -f "node.*vite" || true
pkill -f "http-server" || true
pkill -f "playwright" || true
pkill -f "chromium" || true

# Start the development server
echo "Starting development server..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Capture screenshots using Playwright
echo "Capturing screenshots..."
npx playwright test scripts/demos/voxel-demo-screenshots.spec.ts --project=chromium

# Move screenshots to the demo directory
echo "Moving screenshots to demo directory..."
mv voxel-demo-*.png demos/voxel-engine/screenshots/ 2>/dev/null || true

# Create a video of the demo
echo "Creating a video of the demo..."
npx playwright test scripts/demos/voxel-demo-video.spec.ts --project=chromium

# Move video to the demo directory
echo "Moving video to demo directory..."
mv voxel-demo.webm demos/voxel-engine/videos/ 2>/dev/null || true

# Kill the development server
echo "Cleaning up..."
kill $DEV_PID

echo "Done! Screenshots and video saved to demos/voxel-engine/" 