import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { extractText, getDocumentProxy } from 'unpdf';
import { chunkPages } from '@/lib/chunk';
import { embed } from '@/lib/embed';
import { loadStore, saveStore } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // 1. Extract text page by page
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: false });
    const pages = text;

    // 2. Chunk
    const pieces = chunkPages(pages);
    if (!pieces.length) {
      return NextResponse.json(
        { error: 'No selectable text found. Scanned PDFs need OCR first.' },
        { status: 422 },
      );
    }

    // 3. Embed
    const embeddings = await embed(pieces.map((p) => p.text), 'document');

    // 4. Store
    const docId = randomUUID();
    const doc = {
      id: docId,
      name: file.name,
      pages: pages.length,
      chunks: pieces.length,
      addedAt: new Date().toISOString(),
    };
    const store = await loadStore();
    store.docs.push(doc);
    pieces.forEach((p, i) =>
      store.chunks.push({
        id: `${docId}-${i}`,
        docId,
        docName: file.name,
        page: p.page,
        text: p.text,
        embedding: embeddings[i],
      }),
    );
    await saveStore(store);

    return NextResponse.json({ doc });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}
