# Development Container for Game Builder

This directory contains configuration files for setting up a consistent development environment using VS Code's Development Containers feature.

## Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code

## Getting Started

1. Open VS Code
2. Click on the green icon in the bottom-left corner of the window
3. Select "Reopen in Container" from the menu
4. Wait for the container to build and start (this may take a few minutes the first time)

## Features

- Node.js LTS environment
- All necessary dependencies pre-installed
- Consistent development experience across different platforms
- Port forwarding for Vite development server
- Pre-configured VS Code extensions for Svelte, TypeScript, ESLint, and more

## Running the Application

Once inside the container, you can run the application using:

```bash
npm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is already in use).

## Testing

To run tests:

```bash
npm test
```

## Troubleshooting

If you encounter any issues with the development container:

1. Try rebuilding the container: Click the green icon in the bottom-left corner and select "Rebuild Container"
2. Check Docker Desktop to ensure it's running properly
3. Verify that ports 5173-5180 are not in use by other applications

## Cross-Platform Compatibility

The development container ensures that the application works consistently across different platforms:

- Windows
- macOS
- Linux

This eliminates "works on my machine" problems and makes collaboration easier. 