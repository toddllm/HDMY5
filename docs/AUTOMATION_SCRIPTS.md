# GitHub Pages Automation Scripts

This document explains how to use the automation scripts created for setting up and configuring GitHub Pages.

## Overview

We've created two shell scripts to automate the GitHub Pages setup process:

1. `scripts/setup-github-pages.sh` - Sets up GitHub Pages for the repository
2. `scripts/setup-custom-domain.sh` - Configures a custom domain for GitHub Pages

Both scripts use the GitHub CLI (`gh`) to interact with the GitHub API, which means you need to have GitHub CLI installed and authenticated before using these scripts.

## Prerequisites

1. **Install GitHub CLI**

   Follow the installation instructions at [cli.github.com/manual/installation](https://cli.github.com/manual/installation).

   ```bash
   # For macOS
   brew install gh

   # For Windows (with scoop)
   scoop install gh

   # For Linux (Debian/Ubuntu)
   sudo apt install gh
   ```

2. **Authenticate with GitHub CLI**

   ```bash
   gh auth login
   ```

   Follow the prompts to complete the authentication process.

## Setting Up GitHub Pages

To set up GitHub Pages for your repository:

```bash
./scripts/setup-github-pages.sh
```

This script will:

1. Check if GitHub CLI is installed and authenticated
2. Get your repository information
3. Enable GitHub Pages with the `/docs` folder on the main branch
4. Check the GitHub Pages status
5. Enable HTTPS (recommended)
6. Provide information on setting up a custom domain (optional)

## Setting Up a Custom Domain

To configure a custom domain for your GitHub Pages site:

```bash
./scripts/setup-custom-domain.sh <domain>
```

Replace `<domain>` with your actual domain (e.g., `demo.colorworld.live`).

This script will:

1. Check if GitHub CLI is installed and authenticated
2. Get your repository information
3. Create a CNAME file in the docs directory with your domain
4. Configure the custom domain in GitHub Pages settings
5. Commit and push the CNAME file
6. Provide DNS configuration instructions

Example:

```bash
./scripts/setup-custom-domain.sh demo.colorworld.live
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Check your authentication status:

   ```bash
   gh auth status
   ```

2. Re-authenticate if needed:
   ```bash
   gh auth login
   ```

### Permission Issues

If you encounter permission issues with the scripts:

1. Make sure the scripts are executable:
   ```bash
   chmod +x scripts/setup-github-pages.sh
   chmod +x scripts/setup-custom-domain.sh
   ```

### API Errors

If you encounter GitHub API errors:

1. Check your rate limits:

   ```bash
   gh api rate_limit
   ```

2. Check the specific error message for more details

## Manual Alternative

If you prefer to set up GitHub Pages manually instead of using these scripts, you can follow the instructions in [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md).
