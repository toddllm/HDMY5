# ColorWorld.live Voxel Game

An interactive voxel game demo and editor built with SvelteKit and Three.js.

## Features

- **Interactive Voxel Demo**: Experience a 3D voxel environment
- **Voxel Editor**: Create and customize your own voxel structures
- **Game Builder**: Powerful tool for creating game experiences

## Deployment Information

The application is deployed at [https://colorworld.live](https://colorworld.live) and consists of:

1. A SvelteKit application that provides the interactive components
2. A Node.js Express server that serves the application
3. Nginx as a reverse proxy with HTTPS/SSL support

### Server Setup

The application is configured to run on an AWS EC2 instance with the following components:

- Ubuntu 22.04 LTS
- Node.js v22.14.0 (via NVM)
- Nginx 1.18.0
- Let's Encrypt SSL certificates

### Application Structure

- **Welcome Page**: Entry point at the root URL
- **Routes**:
  - `/voxel-demo`: Interactive voxel demo
  - `/custom-voxel`: Voxel editor
  - `/builder`: Game builder

### Deployment Process

The deployment uses a systemd service to ensure the application runs continuously:

```bash
# Installation
cd ~/colorworld
npm install

# Starting the service
sudo systemctl start colorworld-voxel

# Checking status
sudo systemctl status colorworld-voxel

# Viewing logs
sudo journalctl -u colorworld-voxel
```

### Server Configuration Files

- `simple-server.js`: The Express server that serves the SvelteKit application
- `colorworld-voxel.service`: Systemd service file for managing the application
- `colorworld-nginx.conf`: Nginx configuration for the domain with SSL

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

If you encounter issues with the application:

1. Check the server logs: `sudo journalctl -u colorworld-voxel`
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check for errors in the Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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

## Demos

The project includes several interactive demos that showcase the capabilities of the HDMY5 Game Builder:

### Running the Demos

To run all demos:

```bash
./scripts/demos/serve-all-demos.sh
```

This will start both the development server for the actual demos and an HTTP server for the demo pages. You can then access the demo pages at http://localhost:8080/.

### Available Demos

- **Voxel Engine Demo**: A Minecraft-inspired 3D voxel engine with procedural terrain generation, block placement and destruction, and physics.
  - Demo page: http://localhost:8080/voxel-engine/
  - Actual demo: http://localhost:5173/voxel-demo

### Live Demo on GitHub Pages

Visit our live demo site at: [https://toddllm.github.io/HDMY5/](https://toddllm.github.io/HDMY5/)

The GitHub Pages site features the latest stable version of HDMY5 Game Builder and is automatically updated when changes are pushed to the main branch.

### Capturing Demo Screenshots and Videos

To capture screenshots and videos of the voxel demo:

```bash
./scripts/demos/capture-voxel-demo.sh
```

This will:

1. Start the development server
2. Capture screenshots of the demo
3. Record a video of the demo
4. Save the screenshots and video to the `demos/voxel-engine/` directory

## GitHub Pages

The project is hosted on GitHub Pages, providing a live demonstration of the HDMY5 Game Builder.

### Live Demo

Visit our live demo site at: [https://toddllm.github.io/HDMY5/](https://toddllm.github.io/HDMY5/)

### GitHub Pages Automation

This project includes automation scripts to set up and configure GitHub Pages:

1. **Setup GitHub Pages**: `./scripts/setup-github-pages.sh`

   - Creates and configures a GitHub Pages site for the repository
   - Requires proper GitHub authentication

2. **Configure Custom Domain**: `./scripts/setup-custom-domain.sh [domain]`
   - Sets up a custom domain for the GitHub Pages site
   - Validates the domain and configures DNS settings

For detailed information about the automation scripts, see [docs/AUTOMATION_SCRIPTS.md](docs/AUTOMATION_SCRIPTS.md).
