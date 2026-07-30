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
      // lastmod helps crawlers prioritise recrawls after deploys.
      // Priority tiers:
      //   1.0  home
      //   0.9  main nav / high-traffic hubs (Assembly, Council, parties, …)
      //   0.8  secondary atlases (not in top nav)
      //   0.7  per-district / per-region / per-party detail pages
      //   0.4  legal / static
      serialize(item) {
        item.lastmod = new Date();
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";

        const mainHubs = new Set([
          "/voting",
          "/data",
          "/methodology",
          "/polls",
          "/assembly",
          "/council",
          "/parties",
          "/about",
        ]);
        const atlases = new Set(["/districts", "/regions"]);

        if (path === "/") {
          item.changefreq = "daily";
          item.priority = 1.0;
        } else if (mainHubs.has(path)) {
          item.changefreq = "daily";
          item.priority = 0.9;
        } else if (atlases.has(path)) {
          item.changefreq = "weekly";
          item.priority = 0.8;
        } else if (
          path.startsWith("/districts/") ||
          path.startsWith("/regions/") ||
          path.startsWith("/parties/")
        ) {
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
