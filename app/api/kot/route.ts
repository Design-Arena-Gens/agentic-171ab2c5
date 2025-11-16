import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { KOTTicket } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.kot);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, status } = body as Partial<KOTTicket> & { id: string };
  if (!id || !status) return NextResponse.json({ error: 'id, status required' }, { status: 400 });
  const db = await writeDb((db) => {
    const idx = db.kot.findIndex(k => k.id === id);
    if (idx >= 0) db.kot[idx].status = status;
  });
  return NextResponse.json(db.kot);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    db.kot = db.kot.filter(k => k.id !== id);
  });
  return NextResponse.json(db.kot);
}
