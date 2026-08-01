// Cached HTTP fetch for lead scanning — skip re-download/parse when body unchanged.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * @param {string} cacheDir
 * @param {string} userAgent
 */
export function createFetcher(cacheDir, userAgent) {
  mkdirSync(cacheDir, { recursive: true });
  const bodiesDir = join(cacheDir, "bodies");
  mkdirSync(bodiesDir, { recursive: true });

  /**
   * @param {string} id source id
   * @param {string} url
   * @param {{ force?: boolean }} [opts]
   * @returns {Promise<{ body: string, hash: string, fromCache: boolean, status: number, skippedUnchanged?: boolean, prevHash?: string }>}
   */
  async function fetchText(id, url, opts = {}) {
    const metaPath = join(cacheDir, `${id}.meta.json`);
    let prev = null;
    if (existsSync(metaPath)) {
      try {
        prev = JSON.parse(readFileSync(metaPath, "utf8"));
      } catch {
        prev = null;
      }
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml,application/json,text/xml,*/*",
        "Accept-Language": "en-AU,en;q=0.9",
      },
      redirect: "follow",
    });
    const body = await res.text();
    const hash = sha256(body);
    const bodyPath = join(bodiesDir, `${id}.txt`);

    const unchanged = !opts.force && prev?.hash === hash && prev?.url === url;
    writeFileSync(
      metaPath,
      JSON.stringify(
        {
          id,
          url,
          hash,
          status: res.status,
          fetched_at: new Date().toISOString(),
          bytes: body.length,
        },
        null,
        2
      )
    );
    writeFileSync(bodyPath, body);

    return {
      body,
      hash,
      fromCache: false,
      status: res.status,
      skippedUnchanged: unchanged,
      prevHash: prev?.hash,
    };
  }

  return { fetchText, bodiesDir };
}
