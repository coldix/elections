// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Fully static output. No adapter, no server runtime — see docs/DECISIONS.md
// ADR-2. Every page is derivable at build time from the YAML in data/.
export default defineConfig({
  site: "https://elections.oze.net.au",
  output: "static",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
  devToolbar: {
    enabled: false,
  },
});
