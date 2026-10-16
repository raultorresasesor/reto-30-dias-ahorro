import { defineConfig } from "@playwright/test";
import config from "./playwright.config.js";

export default defineConfig({
  ...config,
  use: {
    ...config.use,
    baseURL: "http://127.0.0.1:4173/reto-30-dias-ahorro/",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/reto-30-dias-ahorro/",
    reuseExistingServer: false,
  },
});
