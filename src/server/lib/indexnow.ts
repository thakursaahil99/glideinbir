// IndexNow — a shared protocol (Bing, Yandex, Seznam, Naver; not Google,
// which doesn't participate) that lets a site push "this URL is new/
// changed" directly instead of waiting for the next crawl. No account or
// API key signup needed — just this random key, verified by hosting it as
// a static file at /{key}.txt (see public/), which submissions reference.
import { env } from "@/config/env";

const INDEXNOW_KEY = "5bc9963642cc391a20c54470bb7db184";

export async function submitUrlsToIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  if (urls.length === 0) return { ok: true, status: 200 };
  const host = new URL(env.NEXT_PUBLIC_SITE_URL).host;

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${env.NEXT_PUBLIC_SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });
  return { ok: res.ok, status: res.status };
}
