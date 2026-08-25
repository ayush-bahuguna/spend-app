interface GiphyImage {
  url: string;
}

interface GiphyGif {
  title?: string;
  images: {
    original?: GiphyImage;
    downsized?: GiphyImage;
  };
}

interface GiphySearchResponse {
  data: GiphyGif[];
}

// Plain "anime money shopping" mostly surfaces generic brand/reaction GIFs.
// These narrower queries were spot-checked against the live API and reliably
// return actual anime clips (Funimation, One Piece, Hokuto no Ken, etc.).
const QUERY_POOL = ["anime money", "anime cash", "one piece money", "anime broke"];

const ANIME_HINT = /anime|funimation|crunchyroll|toei|studio ghibli|shonen|manga|otaku|one piece|naruto|dragon ball|hokuto no ken|lupin|hunter x hunter|jojo|k-on|demon slayer|attack on titan/i;

export async function fetchAnimeMoneyGif(): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GIPHY_API_KEY;
  if (!apiKey) return null;

  const query = QUERY_POOL[Math.floor(Math.random() * QUERY_POOL.length)];
  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    limit: "25",
    rating: "pg-13",
  });

  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params.toString()}`);
    if (!res.ok) return null;
    const json: GiphySearchResponse = await res.json();
    const items = json.data ?? [];
    if (items.length === 0) return null;

    const relevant = items.filter((item) => ANIME_HINT.test(item.title ?? ""));
    const pool = relevant.length > 0 ? relevant : items;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick.images.original?.url ?? pick.images.downsized?.url ?? null;
  } catch {
    return null;
  }
}
