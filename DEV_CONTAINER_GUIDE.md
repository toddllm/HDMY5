# Game Builder Dev Container Guide

This document provides information about the development container setup and testing procedures for the Game Builder project.

## Dev Container Setup

The Game Builder project uses a development container to ensure a consistent development environment across different machines. The container is configured in the `.devcontainer` directory.

### Container Configuration

- **Base Image**: Node.js
- **Exposed Ports**: 5173-5180 (Vite Dev Server)
- **Post-Create Command**: `npm install` (automatically installs dependencies)
- **VS Code Extensions**: Svelte, ESLint, Prettier, TypeScript, Docker, GitHub Copilot, etc.

### Starting the Dev Container

1. Ensure you have Docker and VS Code with the Remote - Containers extension installed
2. Open the project folder in VS Code
3. VS Code will prompt you to reopen the project in a container, or you can click the green button in the bottom-left corner and select "Reopen in Container"
4. The container will build and start automatically

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

This will start the Vite development server at http://localhost:5173.

### Building the Project

```bash
npm run build
```

### Previewing the Build

```bash
npm run preview
```

## Testing

The project uses two testing frameworks:

1. **Jest**: For unit tests
2. **Playwright**: For end-to-end tests

### Running Jest Tests

```bash
npm test
```

This will run all Jest tests in the project.

### Running Playwright Tests

For full end-to-end tests:

```bash
npm run test:e2e
```

For simplified end-to-end tests (more reliable in the dev container):

```bash
npm run test:e2e:simple
```

For visual tests with screenshots:

```bash
npm run test:e2e:visual
```

For voxel engine specific tests:

```bash
npm run test:e2e:voxel
```

The visual and voxel tests run in headless mode but generate screenshots that you can view after the tests complete. Screenshots are saved to the project root directory.

### Viewing Test Reports

Playwright generates HTML reports for test runs. To view the report:

```bash
npm run report:show
```

This will start a local server to display the HTML report. The server runs on port 9323, which is forwarded from the dev container to your host machine.

If you're working in the dev container, you can access the report by:

1. Opening a browser on your host machine
2. Navigating to http://localhost:9323

If you have trouble accessing the report, try these troubleshooting steps:

1. Make sure the dev container is properly configured with port forwarding for port 9323
2. Check that the report server is running by using `curl -I http://localhost:9323` in the terminal
3. If you still can't access the report, try rebuilding the dev container with the updated configuration

Alternatively, you can find screenshots from the tests in the project root directory.

### Running All Tests

```bash
npm run test:all
```

This will run both Jest and simplified Playwright tests.

### Running Specific Tests

To run specific Jest tests:

```bash
npm test -- -t "test name pattern"
```

To run specific Playwright tests:

```bash
npx playwright test tests/simple-test.spec.ts
```

## Accessibility

The project aims to be accessible to all users. We use automated checks to identify potential accessibility issues.

### Checking for Accessibility Issues

```bash
npm run check:a11y
```

This will scan all Svelte components for common accessibility issues, such as:

1. **Click events without keyboard events**: Elements with click handlers should also have keyboard event handlers for accessibility.
2. **Non-interactive elements with click handlers**: Use appropriate interactive elements like buttons instead of divs with click handlers.
3. **Labels without associated controls**: Form labels should be associated with their controls using the `for` attribute.

### Fixing Common Accessibility Issues

1. **Click events without keyboard events**:

   ```svelte
   <!-- Bad -->
   <div on:click={handleClick}>Click me</div>

   <!-- Good -->
   <div
     on:click={handleClick}
     on:keydown={e => e.key === 'Enter' && handleClick(e)}
     role="button"
     tabindex="0"
   >
     Click me
   </div>

   <!-- Better -->
   <button on:click={handleClick}>Click me</button>
   ```

2. **Labels without associated controls**:

   ```svelte
   <!-- Bad -->
   <label>Name:</label>
   <input type="text" />

   <!-- Good -->
   <label for="name">Name:</label>
   <input id="name" type="text" />
   ```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If you already have services running on ports 5173-5180, you may need to stop them or change the port configuration in the dev container.

2. **Container Build Failures**: If the container fails to build, try rebuilding it with the "Rebuild Container" option in VS Code.

3. **Test Failures**: If tests are failing, check the test output for specific error messages. The most common issues are:

   - TypeScript errors (unused variables, type mismatches)
   - Timing issues in Playwright tests (increase timeouts or add wait conditions)

4. **Playwright Browser Installation**: If you see errors about missing Playwright browsers, the test script will automatically install them. If you want to install them manually, run:

   ```bash
   npx playwright install --with-deps chromium
   ```

5. **Accessibility Warnings**: If you see accessibility warnings in the Vite dev server output, use the `npm run check:a11y` command to identify and fix the issues. Common warnings include:
   - `a11y_click_events_have_key_events`: Add keyboard event handlers to elements with click handlers
   - `a11y_no_static_element_interactions`: Add ARIA roles to non-interactive elements with event handlers
   - `a11y_label_has_associated_control`: Associate labels with form controls using the `for` attribute

## Best Practices

1. **Keep Dependencies Updated**: Regularly run `npm update` to keep dependencies up to date.

2. **Run Tests Before Committing**: Always run tests before committing changes to ensure you haven't broken anything.

3. **Use TypeScript Properly**: Make sure to properly type your code to avoid TypeScript errors.

4. **Follow Accessibility Guidelines**: Fix accessibility warnings in the Svelte components to ensure the application is accessible to all users.

## SSH Key Setup for GitHub

The dev container is configured to automatically set up SSH keys for GitHub access. This is handled by the `setup-ssh.sh` script, which is run as part of the container creation process.

### How It Works

1. When the dev container is created, the `setup-ssh.sh` script checks if an SSH key exists.
2. If no key exists, it generates a new SSH key and displays the public key.
3. You need to add this public key to your GitHub account at https://github.com/settings/keys.
4. The script also configures SSH to use this key for GitHub connections.

### Manual Setup

If you need to manually set up SSH keys, you can run:

```bash
./setup-ssh.sh
```

This will generate a new key if one doesn't exist and display instructions for adding it to GitHub.

### Testing the Connection

To test if your SSH key is working correctly with GitHub:

```bash
ssh -T git@github.com
```

If successful, you'll see a message like: "Hi username! You've successfully authenticated, but GitHub does not provide shell access."
