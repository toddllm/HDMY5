/**
 * Simple static file server for the voxel game
 * This server serves static files from the _app directory
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Special routes for SvelteKit app
const svelteKitRoutes = ["/voxel-demo", "/custom-voxel", "/builder"];

// Handle SvelteKit routes
app.get(svelteKitRoutes, (req, res) => {
  console.log(`Serving SvelteKit app for route: ${req.path}`);
  res.sendFile(path.join(__dirname, "sveltekit-index.html"));
});

// Root path - serve our welcome page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve static files from the current directory
app.use(
  express.static(__dirname, {
    maxAge: (req) => {
      // Don't cache HTML files
      if (req.path.endsWith(".html")) {
        return 0;
      }
      // Cache other static assets for a day
      return 86400000; // 1 day in milliseconds
    },
  })
);

// For SvelteKit app routes that don't match above but don't have file extensions
app.get("*", (req, res, next) => {
  if (!req.path.includes(".")) {
    // If it starts with a SvelteKit route prefix but has additional path segments
    const isSvelteKitPath = svelteKitRoutes.some((route) =>
      req.path.startsWith(route + "/")
    );

    if (isSvelteKitPath) {
      console.log(`Serving SvelteKit app for nested route: ${req.path}`);
      return res.sendFile(path.join(__dirname, "sveltekit-index.html"));
    }

    // For any other route without an extension, serve regular index
    return res.sendFile(path.join(__dirname, "index.html"));
  }

  // For requests with extensions that weren't matched by the static middleware
  res.status(404).send("File not found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log("HTTPS enabled through Nginx proxy");
});
