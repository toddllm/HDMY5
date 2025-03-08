#!/bin/bash

# Script to help users rebuild the dev container with the correct configuration

echo "This script will help you rebuild the dev container with the correct configuration."
echo "It will fix the devcontainer.json file and provide instructions for rebuilding."
echo ""

# Fix the devcontainer.json file
./fix-devcontainer.sh

echo ""
echo "The devcontainer.json file has been fixed."
echo ""
echo "To rebuild the dev container:"
echo "1. Exit the current dev container session"
echo "2. In VS Code, click on the green button in the bottom-left corner"
echo "3. Select 'Rebuild Container' from the menu"
echo "4. Wait for the container to rebuild (this may take a few minutes)"
echo ""
echo "After the container is rebuilt, you should be able to access the Playwright report at:"
echo "http://localhost:9323"
echo ""
echo "To generate and view a report, run:"
echo "npm run test:e2e:simple -- --reporter=html,list"
echo "npm run report:show" 