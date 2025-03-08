/**
 * Simple static file server for the voxel game
 * This server serves static files with awareness of HTTPS proxying
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port to listen on
const PORT = 4173;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Log incoming requests
  console.log(
    `${new Date().toISOString()} - ${req.method} ${
      req.url
    } - Forwarded Protocol: ${req.headers["x-forwarded-proto"] || "http"}`
  );

  try {
    // Parse URL path
    let url = req.url;

    // Default to index.html for root requests or client-side routes
    if (
      url === "/" ||
      (url.includes(".") === false && !url.startsWith("/_app"))
    ) {
      // Try to serve index.html
      url = "/index.html";
    }

    // Define possible paths to check
    const pathsToCheck = [
      // First try the root directory
      path.join(__dirname, url.substring(1)),
      // Then try in _app directory for static assets
      path.join(__dirname, "_app", url.substring(1)),
      // Then look in static directory
      path.join(__dirname, "static", url.substring(1)),
      // Try index.html for SPA routes
      url !== "/index.html" ? path.join(__dirname, "index.html") : null,
    ].filter(Boolean);

    // Try each path
    const tryNextPath = (index) => {
      if (index >= pathsToCheck.length) {
        // If we've tried all paths and none worked, return 404
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <head>
              <title>404 Not Found</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 2rem;
                  background: linear-gradient(to right, #f7b733, #fc4a1a);
                  color: white;
                  text-align: center;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                }
                .container {
                  max-width: 800px;
                  padding: 2rem;
                  background-color: rgba(0, 0, 0, 0.2);
                  border-radius: 10px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                p { font-size: 1.25rem; margin-bottom: 1.5rem; }
                a { color: white; text-decoration: underline; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>404 Not Found</h1>
                <p>The requested resource was not found on this server.</p>
                <p>URL: ${url}</p>
                <p><a href="/">Go back to homepage</a></p>
              </div>
            </body>
          </html>
        `);
        return;
      }

      const filePath = pathsToCheck[index];

      // Check if file exists
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // Try next path
          tryNextPath(index + 1);
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
          ".wasm": "application/wasm",
        };

        const contentType = contentTypes[ext] || "application/octet-stream";

        // Read and serve the file
        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <head>
                  <title>500 Server Error</title>
                  <style>
                    body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      margin: 0;
                      padding: 2rem;
                      background: linear-gradient(to right, #f7b733, #fc4a1a);
                      color: white;
                      text-align: center;
                      height: 100vh;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                    }
                    .container {
                      max-width: 800px;
                      padding: 2rem;
                      background-color: rgba(0, 0, 0, 0.2);
                      border-radius: 10px;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    }
                    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                    p { font-size: 1.25rem; margin-bottom: 1.5rem; }
                    pre { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 5px; overflow: auto; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>500 Server Error</h1>
                    <p>Error reading the requested file:</p>
                    <pre>${err.message}</pre>
                  </div>
                </body>
              </html>
            `);
            return;
          }

          // Set Cache-Control header for static assets
          const headers = {
            "Content-Type": contentType,
          };

          if (
            [
              ".css",
              ".js",
              ".png",
              ".jpg",
              ".jpeg",
              ".gif",
              ".svg",
              ".ico",
            ].includes(ext)
          ) {
            headers["Cache-Control"] = "public, max-age=86400"; // Cache for 1 day
          } else {
            headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
          }

          console.log(`Serving file: ${filePath} as ${contentType}`);
          res.writeHead(200, headers);
          res.end(content);
        });
      });
    };

    // Start trying paths
    tryNextPath(0);
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`
      <html>
        <head>
          <title>500 Server Error</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 2rem;
              background: linear-gradient(to right, #f7b733, #fc4a1a);
              color: white;
              text-align: center;
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 800px;
              padding: 2rem;
              background-color: rgba(0, 0, 0, 0.2);
              border-radius: 10px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.25rem; margin-bottom: 1.5rem; }
            pre { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 5px; overflow: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>500 Server Error</h1>
            <p>An internal server error occurred:</p>
            <pre>${error.stack}</pre>
          </div>
        </body>
      </html>
    `);
  }
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Server time: ${new Date().toISOString()}`);
  console.log(`Server directory: ${__dirname}`);
  console.log(`HTTPS is enabled through Nginx proxy`);
});
