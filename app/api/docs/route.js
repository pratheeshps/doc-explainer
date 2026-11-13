import { NextResponse } from 'next/server';
import { loadStore, saveStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { docs } = await loadStore();
  return NextResponse.json({ docs });
}

export async function DELETE(req) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const store = await loadStore();
  store.docs = store.docs.filter((d) => d.id !== id);
  store.chunks = store.chunks.filter((c) => c.docId !== id);
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
