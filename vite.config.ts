import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from https://adamdisa.github.io/wix-chatgpt-demo/ in production; root in dev.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/wix-chatgpt-demo/" : "/",
  plugins: [react(), tailwindcss()],
}));
