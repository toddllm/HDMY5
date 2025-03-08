import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: true, // Use this instead of 0.0.0.0 to ensure binding to all available interfaces
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is in use
    hmr: {
      clientPort: 5173, // Force the client port for HMR
      host: "localhost", // Force HMR to use localhost
    },
    cors: true, // Explicitly enable CORS
    watch: {
      usePolling: true, // Use polling for file watching (more reliable in some environments)
    },
    open: false, // Don't try to open a browser window
  },
});
