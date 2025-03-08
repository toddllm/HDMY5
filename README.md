# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

# HDMY5

## Development Container

This project includes a development container configuration for VS Code, which provides a consistent development environment across different platforms.

### Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code

### Getting Started with Dev Container

1. Open VS Code
2. Click on the green icon in the bottom-left corner of the window
3. Select "Reopen in Container" from the menu
4. Wait for the container to build and start (this may take a few minutes the first time)

For more information, see the [.devcontainer/README.md](.devcontainer/README.md) file.

## Cross-Platform Compatibility

The application is designed to work on all platforms:

- **Windows**: Full support for keyboard and mouse controls
- **macOS**: Adapted controls for trackpad and keyboard
- **Linux**: Full support for keyboard and mouse controls
- **Mobile/Touch Devices**: Basic support with touch controls

The development container ensures a consistent development experience across all platforms.

## Testing in the Dev Container

This project is set up to run tests inside a development container. The container provides a consistent environment for testing across different machines.

### Running Tests

- **Unit Tests**: `npm test`
- **End-to-End Tests**: `npm run test:e2e`
- **Simplified E2E Tests**: `npm run test:e2e:simple` (more reliable in the dev container)
- **Visual Tests**: `./scripts/test/run-visual-tests.sh` (requires Xvfb)
- **Dialog Tests**: `./scripts/test/run-add-object-test.sh` (tests the "Add Object" dialog)
- **All Tests**: `npm run test:all`

### Visual Testing with Xvfb

The project includes scripts for running visual tests with Xvfb, which allows running tests with a virtual display server:

```bash
# Run visual tests and generate an HTML gallery of screenshots
./scripts/test/run-visual-tests.sh

# Test the "Add Object" button functionality
./scripts/test/run-add-object-test.sh

# Run a debug test for troubleshooting UI issues
./scripts/test/cleanup-and-test.sh
```

These scripts will:

1. Start a development server
2. Run tests with Playwright and Xvfb
3. Generate screenshots
4. Create an HTML gallery to view the screenshots
5. Start an HTTP server to serve the gallery

For more information about the test scripts, see [scripts/test/README.md](scripts/test/README.md).

### Viewing Test Reports

Playwright generates HTML reports for test runs. To view the report:

```bash
npm run report:show
```

This will start a local server on port 9323. You can access the report by opening a browser on your host machine and navigating to http://localhost:9323.

If you have trouble accessing the report, you may need to rebuild the dev container with the correct configuration:

```bash
./scripts/rebuild-devcontainer.sh
```

This script will fix the devcontainer.json file and provide instructions for rebuilding the container.

### Screenshots

The tests also generate screenshots that are saved to the project root directory:

- `app-loaded.png`: Shows the application after it has loaded
- `add-object-button.png`: Shows the application with the "Add Object" button

For more detailed information about the dev container and testing, see the [Dev Container Guide](DEV_CONTAINER_GUIDE.md).
