# Scripts Directory

This directory contains utility scripts for development, testing, and environment setup.

## Test Scripts

Located in the `test/` subdirectory:

- `cleanup-and-test.sh`: Runs the button debug test with Xvfb, cleaning up processes first.
- `run-add-object-test.sh`: Tests the "Add Object" button functionality with Xvfb.
- `run-debug-test.sh`: Runs a debug test for troubleshooting UI issues.
- `run-visual-tests.sh`: Runs visual tests with Xvfb and generates an HTML gallery of screenshots.
- `run-visual-tests-xvfb.sh`: Similar to run-visual-tests.sh but with additional Xvfb configuration.

## Utility Scripts

- `check-a11y.sh`: Checks for accessibility issues in the codebase.
- `fix-devcontainer.sh`: Fixes issues with the development container configuration.
- `rebuild-devcontainer.sh`: Rebuilds the development container.
- `setup-dev-container.sh`: Sets up the development container environment.

## Usage

Most scripts can be run directly from the project root:

```bash
./scripts/test/run-visual-tests.sh
```

Make sure to make the scripts executable first:

```bash
chmod +x scripts/test/run-visual-tests.sh
```
