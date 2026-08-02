import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Port 5180, well clear of the 5173-5175 range other local Vite apps sit in.
  // There is no backend here, so there is no CORS whitelist to match and no
  // strictPort: if 5180 is taken, Vite moving to the next free port is fine.
  server: {
    port: 5180,
  },
});
