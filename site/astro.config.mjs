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
  integrations: [
    sitemap({
      // lastmod helps crawlers prioritise recrawls after deploys
      serialize(item) {
        item.lastmod = new Date();
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        const high = new Set([
          "/",
          "/voting",
          "/data",
          "/methodology",
          "/polls",
          "/districts",
          "/parties",
          "/about",
        ]);
        if (high.has(path)) {
          item.changefreq = "daily";
          item.priority = path === "/" ? 1.0 : 0.9;
        } else if (path.startsWith("/districts/") || path.startsWith("/parties/")) {
          item.changefreq = "weekly";
          item.priority = 0.7;
        } else {
          item.changefreq = "monthly";
          item.priority = 0.4;
        }
        return item;
      },
    }),
  ],
  build: {
    inlineStylesheets: "auto",
  },
  devToolbar: {
    enabled: false,
  },
});
