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

   Follow the prompts to complete the authentication process. You will need admin permissions on the repository to use these scripts effectively.

   When prompted for authentication scope, make sure to include:

   - `repo` (Full control of private repositories)
   - `admin:public_key` (Access to SSH keys)
   - `admin:repo_hook` (Access to repository hooks) (optional)

## Setting Up GitHub Pages

To set up GitHub Pages for your repository:

```bash
./scripts/setup-github-pages.sh
```

This script will:

1. Check if GitHub CLI is installed and authenticated
2. Get your repository information
3. Attempt to create the GitHub Pages site
4. Update the GitHub Pages settings to use the `/docs` folder on the main branch
5. Check the GitHub Pages status
6. Attempt to enable HTTPS
7. Provide instructions for manual setup if any step fails
8. Provide information on setting up a custom domain (optional)

### Fallback Manual Setup

If the script encounters errors, it will guide you through the manual setup process:

1. Go to the repository's "Settings" > "Pages" on GitHub
2. Under "Build and deployment", select "Deploy from a branch"
3. Select the "main" branch and the "/docs" folder
4. Click "Save"

## Setting Up a Custom Domain

To configure a custom domain for your GitHub Pages site:

```bash
./scripts/setup-custom-domain.sh <domain>
```

Replace `<domain>` with your actual domain (e.g., `demo.colorworld.live`).

This script will:

1. Check if GitHub CLI is installed and authenticated
2. Get your repository information
3. Verify that GitHub Pages is enabled for the repository
4. Create a CNAME file in the docs directory with your domain
5. Configure the custom domain in GitHub Pages settings
6. Check the GitHub Pages status
7. Commit and push the CNAME file
8. Provide DNS configuration instructions

Example:

```bash
./scripts/setup-custom-domain.sh demo.colorworld.live
```

### Fallback Manual Setup

If the script encounters errors setting the custom domain, it will guide you through the manual process:

1. Go to the repository's "Settings" > "Pages" on GitHub
2. Under "Custom domain", enter your domain name
3. Click "Save"

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Check your authentication status:

   ```bash
   gh auth status
   ```

2. Re-authenticate with sufficient permissions:

   ```bash
   gh auth login
   ```

3. Ensure you have admin permissions on the repository:
   - Go to the repository settings on GitHub
   - Check the "Collaborators and teams" section to confirm your role

### Permission Issues

If you encounter permission issues with the scripts:

1. Make sure the scripts are executable:

   ```bash
   chmod +x scripts/setup-github-pages.sh
   chmod +x scripts/setup-custom-domain.sh
   ```

2. Ensure you're running the scripts from the repository root:
   ```bash
   cd /path/to/repository
   ./scripts/setup-github-pages.sh
   ```

### API Errors

If you encounter GitHub API errors:

1. Check your rate limits:

   ```bash
   gh api rate_limit
   ```

2. Look at the specific error messages output by the script

   - "Not Found" errors may indicate permissions issues or that the repository doesn't exist
   - "Validation Failed" errors may indicate invalid parameters

3. Try the manual setup process described above

## Script Outputs

Both scripts have improved error handling and will provide:

- Clear error messages when something goes wrong
- Detailed information about API responses
- Fallback instructions for manual setup
- Confirmation when operations succeed

## Manual Alternative

If you prefer to set up GitHub Pages manually instead of using these scripts, you can follow the instructions in [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md).
