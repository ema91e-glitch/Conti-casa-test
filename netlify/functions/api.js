import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Con il formato moderno (export default), context.blobs gestisce l'autenticazione automaticamente
  const store = getStore({ name: "conti-di-casa-data", ...context.blobs });

  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing key" }), { status: 400, headers });
  }

  try {
    if (req.method === "GET") {
      const data = await store.get(key);
      return new Response(JSON.stringify({ value: data ? JSON.parse(data) : null }), { status: 200, headers });
    }

    if (req.method === "POST") {
      const body = await req.json();
      await store.set(key, JSON.stringify(body.value));
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response("Method Not Allowed", { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 500, headers });
  }
};
