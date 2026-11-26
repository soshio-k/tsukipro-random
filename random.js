const TALENT_INDEX_URL =
  "https://tsukino-pro.com/talent_artist/talent_artist-cat2/tsukiuta-ta/shiwasu-kakeru-ta/";
const OFFICIAL_ORIGIN = "https://tsukino-pro.com";

module.exports = async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const response = await fetch(TALENT_INDEX_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TsukiproRandomJump/2.0)",
        Accept: "text/html"
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Official talent page returned ${response.status}`);
    }

    const html = await response.text();

    // Extract only the sidebar section between the two headings.
    const start = html.indexOf("タレント名で探す");
    const end = start >= 0
      ? html.indexOf("キャラクターボイスで探す", start)
      : -1;

    if (start < 0 || end < 0 || end <= start) {
      throw new Error('Could not locate the "タレント名で探す" section.');
    }

    const talentSection = html.slice(start, end);
    const anchorPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const profileUrls = new Set();
    let match;

    while ((match = anchorPattern.exec(talentSection)) !== null) {
      const rawHref = match[1].replace(/&amp;/g, "&").trim();

      let url;
      try {
        url = new URL(rawHref, TALENT_INDEX_URL);
      } catch {
        continue;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      const isTalentProfile =
        url.origin === OFFICIAL_ORIGIN &&
        parts.length === 4 &&
        parts[0] === "talent_artist" &&
        parts[1] === "talent_artist-cat2" &&
        parts[3].endsWith("-ta");

      if (isTalentProfile) {
        profileUrls.add(`${OFFICIAL_ORIGIN}/${parts.join("/")}/`);
      }
    }

    const candidates = [...profileUrls];

    if (candidates.length === 0) {
      throw new Error('No talent profile URLs found in the talent-name list.');
    }

    const crypto = require("node:crypto");
    const selected = candidates[crypto.randomInt(0, candidates.length)];

    console.log(`Tsukipro random pool: ${candidates.length} profiles`);
    console.log(`Selected: ${selected}`);

    return res.redirect(302, selected);
  } catch (error) {
    console.error("Tsukipro random redirect failed:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end(
      "ランダム転送に失敗しました。時間をおいて再読み込みしてください。"
    );
  }
};
