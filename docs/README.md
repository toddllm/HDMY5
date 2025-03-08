# HDMY5 Game Builder Documentation

This directory contains the files for the HDMY5 Game Builder documentation and demo page hosted on GitHub Pages.

## Live Website

The live application is now available at [https://colorworld.live](https://colorworld.live).

- Main site: [https://colorworld.live](https://colorworld.live)
- Voxel Demo: [https://colorworld.live/voxel-demo](https://colorworld.live/voxel-demo)
- Voxel Editor: [https://colorworld.live/custom-voxel](https://colorworld.live/custom-voxel)
- Game Builder: [https://colorworld.live/builder](https://colorworld.live/builder)

## Structure

- `index.html` - The main HTML file for the documentation page
- `assets/` - Directory containing CSS, JavaScript, and other assets
  - `css/styles.css` - Main stylesheet
  - `js/main.js` - Main JavaScript file
  - `favicon.png` - Website favicon

## Development

To test this documentation page locally, you can use a simple HTTP server. For example, with Python:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Or with Node.js:

```bash
# Install http-server globally
npm install -g http-server

# Start the server
http-server
```

## Deployment

This documentation page is automatically deployed to GitHub Pages when changes are pushed to the main branch.

The live application is deployed on an AWS EC2 instance running Ubuntu with Nginx and Node.js.

## Project Status

The project has moved from GitHub Pages to a dedicated domain at [ColorWorld.live](https://colorworld.live) for a better user experience and more features.

The GitHub Pages site now serves as documentation and redirects users to the live site.
