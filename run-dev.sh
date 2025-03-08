#!/bin/bash
# Run development server with host option to make it accessible from other machines/containers

# Kill any existing vite processes first
echo "Stopping any running dev servers..."
pkill -f "vite dev" || true

# Start the dev server
echo "Starting dev server with --host option..."
npm run dev

# Note: The --host option is already included in the package.json dev script 