import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      accountThemeImplementation: "none",
      environmentVariables: [
        {
          name: "SHADCN_THEME_LOGO_WHITE_URL",
          default: "https://awras.site/favicon.ico",
        },
        {
          name: "SHADCN_THEME_LOGO_DARK_URL",
          default: "https://awras.site/favicon.ico",
        },
        { name: "SHADCN_THEME_APP_NAME", default: "Awras AI" },
        { name: "SHADCN_THEME_LAYOUT", default: "centered-card" },
        { name: "SHADCN_THEME_SIDE_IMAGE_URL", default: "" },
        { name: "SHADCN_THEME_PRESET", default: "neutral" },
        { name: "SHADCN_THEME_BASE", default: "neutral" },
        { name: "SHADCN_THEME_RADIUS", default: "default" },
        { name: "SHADCN_THEME_FONT", default: "geist" },
        { name: "SHADCN_THEME_PLACEHOLDER", default: "false" },
      ],
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
