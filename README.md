# Doc Explainer (Next.js RAG)

Upload any PDF (reports, contracts, manuals, research papers, policies, notices) and ask questions. Answers come back in plain language with page citations, in English, Malayalam, Hindi or Tamil.

## How it works

```
PDF → text per page (unpdf) → chunks (~1200 chars) → embeddings (Ollama, nomic-embed-text)
     → stored in data/store.json

Question → embedding → top 6 matching chunks (cosine similarity)
         → Ollama (gemma4) answers using only those chunks, citing [S1], [S2]…
```

## Setup

1. Install Ollama (https://ollama.com) and pull the models — no API keys needed:
   ```bash
   ollama pull nomic-embed-text
   ollama pull gemma4
   ```
2. Install and run:
   ```bash
   npm install
   cp .env.example .env.local   # optional: change models / Ollama URL
   npm run dev
   ```
3. Open http://localhost:3000 and upload a PDF.

## Project structure

```
app/page.jsx              UI: upload, document list, chat
app/api/upload/route.js   PDF → chunks → embeddings → store
app/api/ask/route.js      retrieve + answer
app/api/docs/route.js     list / delete documents
lib/chunk.js              page-aware chunking
lib/embed.js              Ollama embeddings (local, free)
lib/llm.js                Ollama chat prompt + call
lib/store.js              JSON-file vector store + cosine search
```

## Notes

- **Scanned PDFs** have no text layer, so they need OCR first (for example `ocrmypdf`).
- **Storage** is a local JSON file, fine for personal use. To deploy (for example on Vercel, where the filesystem resets), swap `lib/store.js` for Postgres + pgvector (Supabase works well).
- This app explains documents. It does not give legal, medical or financial advice.

## Ideas to extend

- Stream answers token by token
- Highlight the cited passage in a PDF viewer
- Preload a fixed library (for example a product manual set or a company policy handbook) and turn off uploads
- Add OCR for scanned documents
