const TALENT_INDEX_URL =
  "https://tsukino-pro.com/talent_artist/talent_artist-cat2/tsukiuta-ta/shiwasu-kakeru-ta/";

const FALLBACK_URL = TALENT_INDEX_URL;
const OFFICIAL_ORIGIN = "https://tsukino-pro.com";

module.exports = async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    // This individual profile page contains the official sidebar section
    // "タレント名で探す", including direct links for all listed talents.
    const response = await fetch(TALENT_INDEX_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TsukiproRandomJump/1.1)",
        Accept: "text/html"
      },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      throw new Error(`Official talent page returned ${response.status}`);
    }

    const html = await response.text();
    const anchorPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const profileUrls = new Set();
    let match;

    while ((match = anchorPattern.exec(html)) !== null) {
      const rawHref = match[1].replace(/&amp;/g, "&").trim();
      let url;
      try {
        url = new URL(rawHref, TALENT_INDEX_URL);
      } catch {
        continue;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      // Individual talent profile URLs have four path parts and end in -ta.
      // Category pages have only three path parts; voice actor links are excluded.
      const isIndividualTalentProfile =
        url.origin === OFFICIAL_ORIGIN &&
        parts.length === 4 &&
        parts[0] === "talent_artist" &&
        parts[1] === "talent_artist-cat2" &&
        parts[3].endsWith("-ta");

      if (isIndividualTalentProfile) {
        profileUrls.add(`${OFFICIAL_ORIGIN}/${parts.join("/")}/`);
      }
    }

    const candidates = [...profileUrls];
    if (candidates.length === 0) {
      throw new Error('No individual profile links found in "タレント名で探す".');
    }

    const selected = candidates[require("node:crypto").randomInt(0, candidates.length)];
    return res.redirect(302, selected);
  } catch (error) {
    console.error("Tsukipro random redirect failed:", error);
    return res.redirect(302, FALLBACK_URL);
  }
};

  // Use Node's cryptographically secure random number generator.
  return require("node:crypto").randomInt(0, length);
}
