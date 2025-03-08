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
