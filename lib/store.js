import fs from 'fs/promises';
import path from 'path';

// Simple JSON-file vector store. Fine for personal use / a few hundred pages.
// Swap for Postgres + pgvector (e.g. Supabase) when you deploy.
const FILE = path.join(process.cwd(), 'data', 'store.json');

export async function loadStore() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return { docs: [], chunks: [] };
  }
}

export async function saveStore(store) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store));
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function search(queryEmbedding, k = 6, docId) {
  const { chunks } = await loadStore();
  return chunks
    .filter((c) => !docId || c.docId === docId)
    .map((c) => ({ chunk: c, score: cosine(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
