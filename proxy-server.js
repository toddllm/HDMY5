/**
 * Production server for SvelteKit app
 *
 * This server serves static files from the client directory
 * and handles SvelteKit's server endpoints
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { handler } from "./server/index.js";

// Convert __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port to listen on
const PORT = 4173;

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Log incoming requests
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  try {
    // Try to handle with SvelteKit's server handler first
    const response = await handler(req);

    if (response) {
      // Write status and headers
      res.writeHead(response.status, Object.fromEntries(response.headers));

      // Send the response body
      if (response.body) {
        res.write(await response.text());
      }

      res.end();
      return;
    }

    // If SvelteKit didn't handle it, try to serve a static file
    const url = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(__dirname, "client", url);

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // File not found, send 404
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(
          "<h1>404 Not Found</h1><p>The requested resource was not found on this server.</p>"
        );
        return;
      }

      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
      };

      const contentType = contentTypes[ext] || "application/octet-stream";

      // Read and serve the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(
            "<h1>500 Server Error</h1><p>Error reading the requested file.</p>"
          );
          return;
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(
      "<h1>500 Server Error</h1><p>An internal server error occurred.</p>"
    );
  }
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access your app at: http://localhost:${PORT}`);
});
