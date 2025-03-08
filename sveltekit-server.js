/**
 * Server for SvelteKit applications
 * This combines static file serving with SvelteKit's server-side functionality
 */

import { handler } from "./.svelte-kit/handler.js";
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

// Special routes handling
const specialRoutes = ["/voxel-demo", "/voxel-editor"];

app.use((req, res, next) => {
  const path = req.path;

  // If it's a special route and doesn't have a file extension
  if (specialRoutes.includes(path) && !path.includes(".")) {
    console.log(`Redirecting special route: ${path} to SvelteKit handler`);
    return handler(req, res, next);
  }

  next();
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname)));

// For all other requests, use the SvelteKit handler
app.use(handler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log("HTTPS enabled through Nginx proxy");
});
