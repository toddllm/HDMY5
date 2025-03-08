#!/bin/bash

# Create a properly formatted devcontainer.json file
cat > .devcontainer/devcontainer.json.new << 'EOF'
{
  "name": "Game Builder Development",
  "dockerFile": "Dockerfile",
  "forwardPorts": [5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 9323],
  "portsAttributes": {
    "5173-5180": {
      "label": "Vite Dev Server",
      "onAutoForward": "notify"
    },
    "9323": {
      "label": "Playwright Report Server",
      "onAutoForward": "notify"
    }
  },
  "postCreateCommand": "npm install && npx playwright install --with-deps chromium && chmod +x *.sh",
  "customizations": {
    "vscode": {
      "extensions": [
        "svelte.svelte-vscode",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "ms-azuretools.vscode-docker",
        "github.copilot",
        "github.vscode-pull-request-github",
        "ms-vsliveshare.vsliveshare"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        },
        "svelte.enable-ts-plugin": true,
        "typescript.tsdk": "node_modules/typescript/lib",
        "files.eol": "\n"
      }
    }
  },
  "remoteUser": "node",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
EOF

# Replace the old file with the new one
mv .devcontainer/devcontainer.json.new .devcontainer/devcontainer.json

echo "devcontainer.json has been fixed." 