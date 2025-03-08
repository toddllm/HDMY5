# Test Scripts

This directory contains scripts for running various tests in the game-builder project.

## Available Scripts

- `cleanup-and-test.sh`: Runs the button debug test with Xvfb, cleaning up processes first. This script:

  - Kills any existing processes that might interfere with testing
  - Starts a development server
  - Runs the button debug test with Xvfb
  - Generates an HTML gallery of screenshots

- `run-add-object-test.sh`: Tests the "Add Object" button functionality with Xvfb. This script:

  - Checks for and installs necessary packages (Xvfb, xauth)
  - Starts a development server
  - Runs a test specifically for the "Add Object" button
  - Generates screenshots and an HTML gallery

- `run-debug-test.sh`: Runs a debug test for troubleshooting UI issues. This script:

  - Kills existing processes
  - Starts a development server
  - Runs a debug test with detailed logging
  - Saves screenshots for analysis

- `run-visual-tests.sh`: Runs visual tests with Xvfb and generates an HTML gallery of screenshots. This script:

  - Checks for and installs necessary packages
  - Starts a development server
  - Runs visual tests with Playwright
  - Generates an HTML gallery of screenshots
  - Serves the gallery on an HTTP server

- `run-visual-tests-xvfb.sh`: Similar to run-visual-tests.sh but with additional Xvfb configuration.

## Usage

Run these scripts from the project root:

```bash
./scripts/test/run-visual-tests.sh
```

Make sure to make the scripts executable first:

```bash
chmod +x scripts/test/run-visual-tests.sh
```

## Output

Most scripts generate screenshots in the project root or in a designated directory (e.g., `visual-test-screenshots/`). These screenshots are automatically ignored by Git via the `.gitignore` file.
