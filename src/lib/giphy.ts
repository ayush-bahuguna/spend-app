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

const CACHE_KEY = "spend:anime-gif-cache:v1";
const CACHE_TTL_MS = 30 * 60 * 1000;
const GIFS_PER_WINDOW = 2;

interface GifCache {
  urls: string[];
  fetchedAt: number;
}

function readCache(): GifCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GifCache>;
    if (!Array.isArray(parsed.urls) || parsed.urls.length === 0 || typeof parsed.fetchedAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return { urls: parsed.urls, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

function writeCache(urls: string[]) {
  try {
    const cache: GifCache = { urls, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore — e.g. private browsing / storage disabled; falls back to
    // fetching fresh every time, which still works, just without caching
  }
}

// Fetches one batch of anime-relevant GIF URLs to seed a fresh 30-minute
// window with. A single search covers the whole window's worth of picks
// rather than one API call per GIF shown.
async function fetchGifBatch(): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GIPHY_API_KEY;
  if (!apiKey) {
    console.warn("[giphy] VITE_GIPHY_API_KEY is missing — skipping GIF fetch");
    return [];
  }

  const query = QUERY_POOL[Math.floor(Math.random() * QUERY_POOL.length)];
  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    limit: "25",
    rating: "pg-13",
  });

  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params.toString()}`);
    if (!res.ok) {
      console.warn("[giphy] search request failed", res.status, await res.text().catch(() => ""));
      return [];
    }
    const json: GiphySearchResponse = await res.json();
    const items = json.data ?? [];
    if (items.length === 0) {
      console.warn("[giphy] search returned no results for query", query);
      return [];
    }

    const relevant = items.filter((item) => ANIME_HINT.test(item.title ?? ""));
    const pool = relevant.length > 0 ? relevant : items;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const urls: string[] = [];
    for (const item of shuffled) {
      const url = item.images.original?.url ?? item.images.downsized?.url;
      if (url && !urls.includes(url)) urls.push(url);
      if (urls.length >= GIFS_PER_WINDOW) break;
    }
    return urls;
  } catch (err) {
    console.warn("[giphy] fetch threw", err);
    return [];
  }
}

export async function fetchAnimeMoneyGif(): Promise<string | null> {
  const cached = readCache();
  if (cached) {
    return cached.urls[Math.floor(Math.random() * cached.urls.length)];
  }

  const urls = await fetchGifBatch();
  if (urls.length === 0) return null;

  writeCache(urls);
  return urls[Math.floor(Math.random() * urls.length)];
}
