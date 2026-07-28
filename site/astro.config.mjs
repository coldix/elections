// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Fully static output. No adapter, no server runtime — see docs/DECISIONS.md
// ADR-2. Every page is derivable at build time from the YAML in data/.
export default defineConfig({
  // Canonical origin — drives canonical URLs, the sitemap and Open Graph tags.
  // Keep in step with SITE.url in src/lib/site.mjs.
  site: "https://electiontracker.au",
  output: "static",
  // No trailing slash anywhere: canonical tags, sitemap entries and the URL
  // Cloudflare actually serves must all agree, or the canonical points at a
  // URL that 307s elsewhere. Paired with "html_handling": "drop-trailing-slash"
  // in wrangler.jsonc — change both together.
  trailingSlash: "never",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
  devToolbar: {
    enabled: false,
  },
});
