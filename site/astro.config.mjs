// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const VIC = "/elections/vic/2026";

export default defineConfig({
  site: "https://electiontracker.au",
  output: "static",
  trailingSlash: "never",
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = new Date();
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        const mainHubs = new Set([
          "/elections",
          "/latest",
          VIC,
          `${VIC}/voting`,
          `${VIC}/data`,
          `${VIC}/polls`,
          `${VIC}/assembly`,
          `${VIC}/council`,
          `${VIC}/parties`,
          "/methodology",
          "/about",
        ]);
        const atlases = new Set([`${VIC}/districts`, `${VIC}/regions`]);

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
          path.startsWith(`${VIC}/districts/`) ||
          path.startsWith(`${VIC}/regions/`) ||
          path.startsWith(`${VIC}/parties/`) ||
          path.startsWith(`${VIC}/policies/`)
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
  build: { inlineStylesheets: "auto" },
  devToolbar: { enabled: false },
});
