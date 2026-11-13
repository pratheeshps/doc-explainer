// Free, local embeddings via Ollama — no API key, no rate limits.
// Requires Ollama running (`ollama serve`) and the model pulled: `ollama pull nomic-embed-text`
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const BATCH = 32;

// nomic-embed-text expects task prefixes for retrieval.
const PREFIX = { document: 'search_document: ', query: 'search_query: ' };

export async function embed(texts, inputType) {
  const inputs = MODEL.startsWith('nomic-embed-text') ? texts.map((t) => PREFIX[inputType] + t) : texts;

  const out = [];
  for (let i = 0; i < inputs.length; i += BATCH) {
    let res;
    try {
      res = await fetch(`${OLLAMA_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, input: inputs.slice(i, i + BATCH) }),
      });
    } catch {
      throw new Error(`Cannot reach Ollama at ${OLLAMA_URL}. Start it with \`ollama serve\`.`);
    }
    if (!res.ok) {
      const msg = await res.text();
      const hint = res.status === 404 ? ` (run \`ollama pull ${MODEL}\`)` : '';
      throw new Error(`Ollama error ${res.status}: ${msg}${hint}`);
    }
    const json = await res.json();
    out.push(...json.embeddings);
  }
  return out;
}
