#!/bin/bash

# Kill all relevant processes
echo "Forcefully killing all relevant processes..."
pkill -f "node.*vite" || true
pkill -f "http-server" || true
pkill -f "playwright" || true
pkill -f "chromium" || true
pkill -f "chrome" || true
pkill -f "npm run dev" || true

# Kill processes using specific ports
echo "Killing processes using ports 5173 and 8083..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:8083 | xargs kill -9 2>/dev/null || true

# Wait a moment to ensure all processes are terminated
sleep 2

# Check if xvfb-run is installed
if ! command -v xvfb-run &> /dev/null; then
    echo "xvfb-run is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y xvfb xauth
fi

# Install Playwright browsers if needed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "Installing Playwright browsers..."
    npx playwright install chromium
fi

# Create screenshots directory
SCREENSHOTS_DIR="./visual-test-screenshots"
mkdir -p $SCREENSHOTS_DIR
echo "Screenshots will be saved to $SCREENSHOTS_DIR"

# Clean up any existing test screenshots
rm -f *.png

# Start the dev server
echo "Starting dev server on port 5173..."
PORT=5173 npm run dev > dev-server.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for dev server to start
echo "Waiting for dev server to start..."
MAX_WAIT=30
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if grep -q "Local:   http://localhost:5173" dev-server.log; then
        echo "Dev server started successfully on port 5173"
        break
    fi
    
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
    echo -n "."
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo "Failed to detect dev server port within $MAX_WAIT seconds."
    cat dev-server.log
    exit 1
fi

echo "Running visual tests with Xvfb..."
xvfb-run --auto-servernum --server-args="-screen 0 1280x960x24" npx playwright test tests/visual-test.spec.ts --project=chromium

echo "Copying screenshots to $SCREENSHOTS_DIR..."
for file in *.png; do
    if [ -f "$file" ]; then
        cp "$file" "$SCREENSHOTS_DIR/"
        echo "Copied $file to $SCREENSHOTS_DIR/"
    fi
done

echo "Creating HTML gallery..."
cat > "$SCREENSHOTS_DIR/index.html" << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Test Screenshots</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .screenshot {
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .screenshot img {
            width: 100%;
            height: auto;
            display: block;
        }
        .screenshot h3 {
            padding: 10px;
            margin: 0;
            background-color: #f0f0f0;
            border-bottom: 1px solid #ddd;
        }
        .screenshot p {
            padding: 10px;
            margin: 0;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Visual Test Screenshots</h1>
    
    <div class="screenshots">
EOL

# Add each screenshot to the gallery
for file in "$SCREENSHOTS_DIR"/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        title=$(echo "$filename" | sed 's/\.png$//' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
        
        cat >> "$SCREENSHOTS_DIR/index.html" << EOL
        <div class="screenshot">
            <h3>$title</h3>
            <img src="$filename" alt="$title">
            <p>Screenshot from the visual test.</p>
        </div>
EOL
    fi
done

# Close the HTML file
cat >> "$SCREENSHOTS_DIR/index.html" << 'EOL'
    </div>
</body>
</html>
EOL

echo "HTML gallery created at $SCREENSHOTS_DIR/index.html"

echo "Starting HTTP server to view screenshots..."
cd "$SCREENSHOTS_DIR" && npx http-server -p 8083 &
HTTP_SERVER_PID=$!

echo "Screenshots available at http://localhost:8083/"
echo "Press Ctrl+C to stop the servers."

# Set up trap to clean up on exit
function cleanup {
    echo "Cleaning up processes..."
    
    # Kill the dev server
    if [ ! -z "$DEV_SERVER_PID" ]; then
        echo "Stopping dev server (PID: $DEV_SERVER_PID)"
        kill -9 $DEV_SERVER_PID 2>/dev/null || true
    fi
    
    # Kill the HTTP server
    if [ ! -z "$HTTP_SERVER_PID" ]; then
        echo "Stopping HTTP server (PID: $HTTP_SERVER_PID)"
        kill -9 $HTTP_SERVER_PID 2>/dev/null || true
    fi
    
    # Kill all remaining processes
    pkill -f "node.*vite" || true
    pkill -f "http-server" || true
    
    echo "Cleanup complete."
}

trap cleanup EXIT INT TERM

# Wait for user to press Ctrl+C
wait 