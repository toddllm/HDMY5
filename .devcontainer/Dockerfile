FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libgl1-mesa-dev \
    xvfb \
    libxi-dev \
    libxcursor-dev \
    libxrandr-dev \
    libxinerama-dev \
    libasound2-dev \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install global node packages without trying to update npm itself
RUN npm install -g pnpm@8.15.4 \
    && npm install -g @playwright/test@1.42.1

# Setup for non-root user
USER node

# Install Playwright browsers
RUN mkdir -p /home/node/.cache/ms-playwright \
    && npx playwright install --with-deps chromium

# Set up a working directory
WORKDIR /workspace
