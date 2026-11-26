const characters = [
  {
    name: "神楽坂宗司",
    url: "https://tsukino-pro.com/talent_artist/talent_artist-cat2/alive-ta/kagurazaka-soushi-ta/"
  },

  // ここに全キャラクターの個別URLを追加
];

export default function middleware(request) {
  const index = Math.floor(
    Math.random() * characters.length
  );

  const selected = characters[index];

  return new Response(null, {
    status: 302,
    headers: {
      Location: selected.url,
      "Cache-Control": "no-store"
    }
  });
}

export const config = {
  matcher: "/"
};