/**
 * KD SONDAJ — IndexNow Automated Submission Utility
 * Sends updated URLs directly to Bing, Yandex and IndexNow participating search engines.
 */

export const INDEXNOW_KEY = "e7f29a0b18c445698b67d5e49321c834";
export const INDEXNOW_HOST = "kdsondaj.com.tr";

export async function submitIndexNow(urlList) {
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urlList || [
      `https://${INDEXNOW_HOST}/`,
      `https://${INDEXNOW_HOST}/en/`,
      `https://${INDEXNOW_HOST}/ar/`,
      `https://${INDEXNOW_HOST}/ekipman/sondaj-makineleri/`,
      `https://${INDEXNOW_HOST}/en/equipment/drilling-rigs/`,
      `https://${INDEXNOW_HOST}/ar/equipment/drilling-rigs/`
    ]
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
