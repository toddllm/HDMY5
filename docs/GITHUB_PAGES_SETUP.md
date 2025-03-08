# Setting Up GitHub Pages for Your Project

This document provides step-by-step instructions for setting up GitHub Pages for your project using both the GitHub web interface and the GitHub CLI.

## What is GitHub Pages?

GitHub Pages is a static site hosting service that takes HTML, CSS, and JavaScript files directly from a repository on GitHub and publishes a website. It's perfect for project documentation, demos, and simple websites.

## Method 1: Using the GitHub Web Interface

1. **Navigate to your repository** on GitHub.com.

2. **Go to the repository settings**:

   - Click on the "Settings" tab in the top navigation bar.

3. **Find the GitHub Pages section**:

   - In the left sidebar, click on "Pages".

4. **Configure the source**:

   - Under "Source", select the branch you want to deploy from (usually `main` or `master`).
   - Select the folder (use `/docs` if you've set up the structure like in this project).
   - Click "Save".

5. **Choose a theme (optional)**:

   - You can select a theme for your GitHub Pages site if you want to use Jekyll.
   - For custom HTML/CSS (like we've set up), you don't need to select a theme.

6. **Access your published site**:
   - Once configured, GitHub will show you the URL of your published site.
   - It usually follows the pattern: `https://username.github.io/repository-name`.
   - Note that it may take a few minutes for your site to be published.

## Method 2: Using the GitHub CLI

The GitHub CLI (Command Line Interface) allows you to manage GitHub Pages settings from your terminal.

1. **Install the GitHub CLI** (if not already installed):

   ```bash
   # For macOS
   brew install gh

   # For Windows (with scoop)
   scoop install gh

   # For Linux (Debian/Ubuntu)
   sudo apt install gh
   ```

2. **Authenticate with GitHub**:

   ```bash
   gh auth login
   ```

   Follow the prompts to complete the authentication process.

3. **Enable GitHub Pages**:

   ```bash
   gh api \
     --method PUT \
     -H "Accept: application/vnd.github+json" \
     /repos/OWNER/REPO/pages \
     -f source='{"branch":"main","path":"/docs"}'
   ```

   Replace `OWNER` with your GitHub username and `REPO` with your repository name.

4. **Check GitHub Pages status**:

   ```bash
   gh api \
     -H "Accept: application/vnd.github+json" \
     /repos/OWNER/REPO/pages
   ```

   This will show you the current GitHub Pages configuration for your repository.

5. **Update GitHub Pages settings**:

   ```bash
   # To update the branch or directory
   gh api \
     --method PUT \
     -H "Accept: application/vnd.github+json" \
     /repos/OWNER/REPO/pages \
     -f source='{"branch":"main","path":"/docs"}'

   # To enable HTTPS (recommended)
   gh api \
     --method PUT \
     -H "Accept: application/vnd.github+json" \
     /repos/OWNER/REPO/pages \
     -f https_enforced=true
   ```

## Setting Up a Custom Domain (Optional)

To use a custom domain like `colorworld.live` with your GitHub Pages site:

1. **Update your DNS settings**:

   - Create an A record pointing to GitHub Pages IP addresses:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - If using a subdomain (e.g., `demo.colorworld.live`), create a CNAME record pointing to `username.github.io`.

2. **Configure the custom domain in GitHub**:

   Using the web interface:

   - Go to repository settings > Pages.
   - Under "Custom domain", enter your domain name (e.g., `colorworld.live` or `demo.colorworld.live`).
   - Click "Save".

   Using the GitHub CLI:

   ```bash
   gh api \
     --method PUT \
     -H "Accept: application/vnd.github+json" \
     /repos/OWNER/REPO/pages \
     -f cname='demo.colorworld.live'
   ```

3. **Create a CNAME file**:

   ```bash
   echo "demo.colorworld.live" > docs/CNAME
   git add docs/CNAME
   git commit -m "Add CNAME for custom domain"
   git push
   ```

4. **Verify your domain** (recommended):
   - GitHub will prompt you to add a TXT record to your DNS to verify ownership of your domain.
   - Follow the instructions provided by GitHub to complete the verification process.

## Best Practices

1. **Test locally before publishing**:

   ```bash
   cd docs
   python -m http.server 8000
   # Then open http://localhost:8000 in your browser
   ```

2. **Optimize for performance**:

   - Minimize image sizes.
   - Use compression for CSS and JavaScript files.
   - Consider using a CDN for large assets.

3. **Use GitHub Actions for more complex builds**:

   - If you need to compile or build your site (e.g., using frameworks like React or Vue), consider setting up a GitHub Action to automate the build process.

4. **Monitor your site**:
   - GitHub provides basic traffic analytics for GitHub Pages sites in the repository Insights section.

## Troubleshooting

1. **Site not publishing**:

   - Check that your repository is public, or that you have GitHub Pro for private repositories.
   - Verify that your source branch and directory are correctly configured.
   - Look for build errors in the Actions tab of your repository.

2. **Custom domain not working**:

   - Ensure DNS records are correctly configured.
   - Check that the CNAME file exists in the root of your published site.
   - DNS changes can take time to propagate (up to 48 hours).

3. **Getting a 404 error**:
   - Make sure you have an `index.html` file in the root of your published directory.
   - Check that file paths in your HTML are correct (use relative paths).

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Jekyll Documentation](https://jekyllrb.com/docs/) (if using Jekyll)
- [Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
