#!/bin/bash

echo "Installing Xvfb and xauth if not already installed..."
if ! command -v xvfb-run &> /dev/null || ! command -v xauth &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y xvfb xauth
fi

echo "Installing Playwright browsers if not already installed..."
npx playwright install chromium

# Create screenshots directory
SCREENSHOTS_DIR="./test-screenshots"
mkdir -p $SCREENSHOTS_DIR
echo "Screenshots will be saved to $SCREENSHOTS_DIR"

# Clean up any existing screenshots
rm -f *.png

echo "Starting dev server..."
echo "Waiting for dev server to start..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for dev server to start
sleep 3
echo "Dev server started successfully."

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
cd "$SCREENSHOTS_DIR" && npx http-server -p 8080 &
HTTP_SERVER_PID=$!

echo "Screenshots available at http://localhost:8080/"
echo "Press Ctrl+C to stop the servers."

echo "Generating and showing report..."
npm run report:show &

# Wait for user to press Ctrl+C
trap "kill $DEV_SERVER_PID $HTTP_SERVER_PID 2>/dev/null" EXIT
wait 