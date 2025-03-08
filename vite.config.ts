import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: "0.0.0.0", // Listen on all network interfaces
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is in use
    hmr: {
      clientPort: 5173, // Force the client port for HMR
    },
  },
});
