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
// return actual anime clips across a range of shows (Funimation, One Piece,
// Uma Musume, Jujutsu Kaisen, Golden Kamuy, Naruto, Demon Slayer, Cyberpunk:
// Edgerunners, etc.) rather than leaning on any single franchise.
const QUERY_POOL = ["anime money", "anime cash", "anime gold", "anime treasure", "anime poor"];

// Screens out fanservice/thirst-trap results that "anime <money-word>"
// queries occasionally surface (e.g. shower/bath scenes).
const NSFW_HINT =
  /shower|bath(?:ing|tub)?|onsen|hot ?spring|bikini|swimsuit|lingerie|underwear|panties|nude|naked|sexy|thirst|ecchi|boob|breast|cleavage|\bass\b|booty|thicc|jiggl/i;

const CACHE_KEY = "spend:anime-gif-cache:v1";
const CACHE_TTL_MS = 30 * 60 * 1000;
const GIFS_PER_WINDOW = 15;

// Avoids showing the same GIF twice in a row within a session.
let lastShownUrl: string | null = null;

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

    const pool = items.filter((item) => !NSFW_HINT.test(item.title ?? ""));
    if (pool.length === 0) {
      console.warn("[giphy] all results filtered out as NSFW for query", query);
      return [];
    }

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

function pickUrl(urls: string[]): string {
  const choices = urls.length > 1 ? urls.filter((url) => url !== lastShownUrl) : urls;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  lastShownUrl = pick;
  return pick;
}

export async function fetchAnimeMoneyGif(): Promise<string | null> {
  const cached = readCache();
  if (cached) {
    return pickUrl(cached.urls);
  }

  const urls = await fetchGifBatch();
  if (urls.length === 0) return null;

  writeCache(urls);
  return pickUrl(urls);
}
