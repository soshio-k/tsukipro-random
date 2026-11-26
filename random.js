const TALENT_LIST_URL = "https://tsukino-pro.com/talent_artist/";
const FALLBACK_URL = TALENT_LIST_URL;

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const response = await fetch(TALENT_LIST_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TsukiproRandomJump/1.0)",
        "Accept": "text/html"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Official talent page returned ${response.status}`);
    }

    const html = await response.text();
    const anchorPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const profileUrls = new Set();
    let match;

    while ((match = anchorPattern.exec(html)) !== null) {
      const rawHref = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&#0*39;/g, "'")
        .trim();

      let url;
      try {
        url = new URL(rawHref, TALENT_LIST_URL);
      } catch {
        continue;
      }

      // Official individual talent profiles use URLs ending in "-ta/".
      // Exclude category pages and any off-domain links.
      const parts = url.pathname.split("/").filter(Boolean);
      const isTalentProfile =
        url.origin === "https://tsukino-pro.com" &&
        parts.length >= 4 &&
        parts[0] === "talent_artist" &&
        parts[parts.length - 1].endsWith("-ta");

      if (isTalentProfile) {
        profileUrls.add(url.origin + url.pathname);
      }
    }

    const candidates = [...profileUrls];

    if (candidates.length === 0) {
      throw new Error("No individual talent profile URLs were found.");
    }

    const selected = candidates[cryptoRandomIndex(candidates.length)];
    return res.redirect(302, selected);
  } catch (error) {
    console.error("Tsukipro random redirect failed:", error);
    return res.redirect(302, FALLBACK_URL);
  }
};

function cryptoRandomIndex(length) {
  // Use Node's cryptographically secure random number generator.
  return require("node:crypto").randomInt(0, length);
}
