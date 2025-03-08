#!/bin/bash

# Script to test X11 forwarding

echo "Testing X11 forwarding..."
echo "DISPLAY=$DISPLAY"

if [ -z "$DISPLAY" ]; then
  echo "Error: DISPLAY environment variable is not set."
  echo "X11 forwarding is not properly configured."
  echo ""
  echo "For Mac OS with XQuartz:"
  echo "1. Make sure XQuartz is running"
  echo "2. In XQuartz preferences, go to the 'Security' tab and check 'Allow connections from network clients'"
  echo "3. Restart XQuartz"
  echo ""
  echo "For VS Code Remote Containers:"
  echo "1. Exit the current container"
  echo "2. Add the following to your devcontainer.json:"
  echo "   \"runArgs\": [\"-e\", \"DISPLAY=host.docker.internal:0\"],"
  echo "3. Rebuild the container"
  echo ""
  exit 1
fi

# Try to install xeyes if it's not already installed
if ! command -v xeyes &> /dev/null; then
  echo "Installing x11-apps..."
  apt-get update && apt-get install -y x11-apps || true
fi

# Try to run a simple X11 application
if command -v xeyes &> /dev/null; then
  echo "Running xeyes to test X11 forwarding..."
  echo "You should see a window with eyes that follow your mouse cursor."
  echo "Press Ctrl+C to exit."
  xeyes
else
  echo "Could not find xeyes. Trying to use a simple X11 test instead..."
  # Create a simple X11 test using xmessage
  if command -v xmessage &> /dev/null; then
    xmessage -center "X11 forwarding is working!"
  else
    echo "Could not find xmessage either. X11 applications are not available."
    echo "Please install x11-apps package manually:"
    echo "sudo apt-get update && sudo apt-get install -y x11-apps"
  fi
fi 