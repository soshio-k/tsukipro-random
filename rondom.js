
const characters = [
  {
    name: "神楽坂宗司",
    url: "https://tsukino-pro.com/talent_artist/talent_artist-cat2/alive-ta/kagurazaka-soushi-ta/"
  }

  // ここに個別プロフィールURLを追加
];

module.exports = (req, res) => {
  const index = Math.floor(
    Math.random() * characters.length
  );

  const selected = characters[index];

  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, selected.url);
};
