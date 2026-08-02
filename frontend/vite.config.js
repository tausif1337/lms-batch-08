// Vite is the tool that runs the app while you work on it.
// This file tells it two things: use React, and use Tailwind.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Which port to open on. Other projects on this machine already use
  // 5173 to 5175, so this one uses 5180 to stay out of their way.
  // If 5180 is busy too, Vite quietly picks the next free number and tells
  // you which one in the terminal.
  server: {
    port: 5180,
  },
});
