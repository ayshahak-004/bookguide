const USER_AGENT =
  "OmaniBookCompareBot/1.0 (+university project; contact: ayshahak7@gmail.com)";

const REQUEST_DELAY_MS = 1000;

let lastRequestAt = 0;

async function throttle() {
  const wait = REQUEST_DELAY_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function politeFetch(url: string): Promise<Response | null> {
  await throttle();
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      console.warn(`  [skip] ${res.status} ${url}`);
      return null;
    }
    return res;
  } catch (err) {
    console.warn(`  [skip] fetch error for ${url}: ${(err as Error).message}`);
    return null;
  }
}

export async function politeFetchText(url: string): Promise<string | null> {
  const res = await politeFetch(url);
  if (!res) return null;
  return res.text();
}

export async function politeFetchJson<T>(url: string): Promise<T | null> {
  const res = await politeFetch(url);
  if (!res) return null;
  try {
    return (await res.json()) as T;
  } catch {
    console.warn(`  [skip] invalid JSON from ${url}`);
    return null;
  }
}
