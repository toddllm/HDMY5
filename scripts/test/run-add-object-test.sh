#!/bin/bash

# Fixed ports
DEV_SERVER_PORT=5173
HTTP_SERVER_PORT=8082

# Function to clean up processes on exit
cleanup() {
    echo "Cleaning up processes..."
    
    # Kill the dev server if it's running
    if [ ! -z "$DEV_SERVER_PID" ]; then
        echo "Stopping dev server (PID: $DEV_SERVER_PID)"
        kill -9 $DEV_SERVER_PID 2>/dev/null || true
    fi
    
    # Kill the HTTP server if it's running
    if [ ! -z "$HTTP_SERVER_PID" ]; then
        echo "Stopping HTTP server (PID: $HTTP_SERVER_PID)"
        kill -9 $HTTP_SERVER_PID 2>/dev/null || true
    fi
    
    # Kill any processes using our ports
    echo "Checking for processes using ports $DEV_SERVER_PORT, $HTTP_SERVER_PORT..."
    lsof -ti:$DEV_SERVER_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti:$HTTP_SERVER_PORT | xargs kill -9 2>/dev/null || true
    
    echo "Cleanup complete."
}

# Set up trap to call cleanup function on exit
trap cleanup EXIT INT TERM

echo "Installing Xvfb and xauth if not already installed..."
if ! command -v xvfb-run &> /dev/null || ! command -v xauth &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y xvfb xauth
fi

echo "Installing Playwright browsers if not already installed..."
npx playwright install chromium

# Create screenshots directory
SCREENSHOTS_DIR="./add-object-test-screenshots"
mkdir -p $SCREENSHOTS_DIR
echo "Screenshots will be saved to $SCREENSHOTS_DIR"

# Clean up any existing test screenshots
rm -f add-object-test-*.png

# Kill any processes using our ports before starting
echo "Checking for processes using ports $DEV_SERVER_PORT, $HTTP_SERVER_PORT..."
lsof -ti:$DEV_SERVER_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$HTTP_SERVER_PORT | xargs kill -9 2>/dev/null || true

# Start the dev server
echo "Starting dev server on port $DEV_SERVER_PORT..."
PORT=$DEV_SERVER_PORT npm run dev > dev-server.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for dev server to start
echo "Waiting for dev server to start..."
MAX_WAIT=30
WAIT_COUNT=0
DEV_SERVER_STARTED=false

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if grep -q "Local:   http://localhost:$DEV_SERVER_PORT" dev-server.log; then
        DEV_SERVER_STARTED=true
        echo "Dev server started successfully on port $DEV_SERVER_PORT"
        break
    fi
    
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
    echo -n "."
done

if [ "$DEV_SERVER_STARTED" = false ]; then
    echo "Failed to detect dev server port within $MAX_WAIT seconds."
    cat dev-server.log
    exit 1
fi

# Create a test file with the correct port
cat > tests/add-object-test.spec.ts << EOL
import { test, expect } from "@playwright/test";

// Slow down actions for better visibility
const SLOW_MOTION = 1000; // milliseconds between actions

test.describe("Add Object Button Test", () => {
  test("should open dialog when Add Object button is clicked", async ({ page }) => {
    console.log("🚀 Starting test setup...");

    // Navigate to the application
    await page.goto("http://localhost:$DEV_SERVER_PORT/");
    console.log("📱 Navigated to application");

    // Wait for the application to load
    await page.waitForSelector(".editor-layout", {
      state: "visible",
      timeout: 10000,
    });
    console.log("✅ Application loaded successfully");
    await page.screenshot({ path: "add-object-test-initial.png" });

    // Click the New Scene button first
    const newSceneButton = await page.getByText("New Scene");
    console.log("🖱️ Clicking New Scene button");
    await newSceneButton.click();
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "add-object-test-after-new-scene.png" });

    // Find the Add Object button
    console.log("🔍 Looking for Add Object button");
    const addObjectButton = await page.getByText("Add Object");
    
    // Check if it's enabled
    const isEnabled = !(await addObjectButton.isDisabled());
    console.log(\`Add Object button enabled: \${isEnabled}\`);
    await page.screenshot({ path: "add-object-test-before-click.png" });

    // Try to click the Add Object button using different methods
    console.log("🖱️ Attempting to click Add Object button using page.getByText");
    await addObjectButton.click({ force: true });
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "add-object-test-after-click-1.png" });

    // Try to find the dialog
    console.log("🔍 Checking for dialog after first click attempt");
    const dialogVisible1 = await page.isVisible(".dialog-content");
    console.log(\`Dialog visible after first click: \${dialogVisible1}\`);

    // Try clicking by selector
    console.log("🖱️ Attempting to click Add Object button using selector");
    await page.click("button:has-text('Add Object')", { force: true });
    await page.waitForTimeout(SLOW_MOTION);
    await page.screenshot({ path: "add-object-test-after-click-2.png" });

    // Check again for dialog
    console.log("🔍 Checking for dialog after second click attempt");
    const dialogVisible2 = await page.isVisible(".dialog-content");
    console.log(\`Dialog visible after second click: \${dialogVisible2}\`);

    // Try to find any dialog or form element
    console.log("🔍 Checking for any dialog or form elements");
    const selectors = [
      ".dialog-content",
      ".modal",
      "dialog",
      "[role='dialog']",
      ".object-creation-dialog",
      "form",
      ".dialog",
      ".popup",
      ".overlay"
    ];

    for (const selector of selectors) {
      const isVisible = await page.isVisible(selector);
      console.log(\`Selector "\${selector}" visible: \${isVisible}\`);
      if (isVisible) {
        console.log(\`Found visible element with selector: \${selector}\`);
        await page.screenshot({ path: \`add-object-test-found-\${selector.replace(/[^a-zA-Z0-9]/g, "-")}.png\` });
      }
    }

    // Check the DOM structure
    console.log("📄 Examining page structure");
    const html = await page.content();
    console.log("HTML snippet:");
    console.log(html.substring(0, 500) + "...");

    // Take a final screenshot
    await page.screenshot({ path: "add-object-test-final.png" });
    
    console.log("✅ Test completed");
  });
});
EOL

echo "Running add-object test with Xvfb..."
xvfb-run --auto-servernum --server-args="-screen 0 1280x960x24" npx playwright test tests/add-object-test.spec.ts --project=chromium

echo "Copying screenshots to $SCREENSHOTS_DIR..."
for file in add-object-test-*.png; do
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
    <title>Add Object Test Screenshots</title>
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
    <h1>Add Object Test Screenshots</h1>
    
    <div class="screenshots">
EOL

# Add each screenshot to the gallery
for file in "$SCREENSHOTS_DIR"/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        title=$(echo "$filename" | sed 's/add-object-test-//' | sed 's/\.png$//' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
        
        cat >> "$SCREENSHOTS_DIR/index.html" << EOL
        <div class="screenshot">
            <h3>$title</h3>
            <img src="$filename" alt="$title">
            <p>Screenshot from the add object test.</p>
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
cd "$SCREENSHOTS_DIR" && npx http-server -p $HTTP_SERVER_PORT &
HTTP_SERVER_PID=$!

echo "Screenshots available at http://localhost:$HTTP_SERVER_PORT/"
echo "Press Ctrl+C to stop the servers."

# Wait for user to press Ctrl+C
wait 