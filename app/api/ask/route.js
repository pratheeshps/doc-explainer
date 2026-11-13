import { NextResponse } from 'next/server';
import { embed } from '@/lib/embed';
import { answer } from '@/lib/llm';
import { loadStore, search } from '@/lib/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json();
    const question = body.question?.trim();
    if (!question) return NextResponse.json({ error: 'Question is empty' }, { status: 400 });

    const { docs } = await loadStore();
    if (!docs.length) {
      return NextResponse.json({ error: 'Upload a document first' }, { status: 400 });
    }

    const history = (body.history ?? []).slice(-4);
    // Include the previous question so follow-ups like "explain that more" still retrieve well.
    const lastUserQ = [...history].reverse().find((m) => m.role === 'user')?.text ?? '';
    const [qEmb] = await embed([`${lastUserQ}\n${question}`.trim()], 'query');

    const hits = await search(qEmb, 6, body.docId);
    const sources = hits.map((h, i) => ({
      n: i + 1,
      docName: h.chunk.docName,
      page: h.chunk.page,
      text: h.chunk.text,
    }));
    const excerpts = sources
      .map((s) => `[S${s.n}] (${s.docName}, page ${s.page})\n${s.text}`)
      .join('\n\n');

    const text = await answer({
      question,
      excerpts,
      language: body.language || 'English',
      history,
    });

    return NextResponse.json({ answer: text, sources });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Something went wrong' }, { status: 500 });
  }
}
