import { getStore } from "@netlify/blobs";

export async function handler(event, context) {
  // Inizializza lo store usando il contesto di Netlify
  const store = getStore({
    name: "conti-di-casa-data",
    siteID: context?.clientContext?.custom?.netlify?.site_id || process.env.SITE_ID,
    token: context?.clientContext?.custom?.netlify?.token || process.env.NETLIFY_BLOBS_CONTEXT,
    ...context?.blobs
  });

  const method = event.httpMethod;
  const key = event.queryStringParameters && event.queryStringParameters.key;

  if (!key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing key" })
    };
  }

  try {
    if (method === "GET") {
      const data = await store.get(key);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: data ? JSON.parse(data) : null })
      };
    } else if (method === "POST") {
      const body = JSON.parse(event.body);
      await store.set(key, JSON.stringify(body.value));
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true })
      };
    }
    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
}
