import { NextResponse } from 'next/server';
import { readDb, writeDb, nanoid } from '@/lib/db';
import { CafeTable } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.tables);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body as Partial<CafeTable>;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const db = await writeDb((db) => {
    const t: CafeTable = { id: nanoid(), name, status: 'vacant' };
    db.tables.push(t);
  });
  return NextResponse.json(db.tables);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...rest } = body as Partial<CafeTable> & { id: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    const idx = db.tables.findIndex(t => t.id === id);
    if (idx >= 0) {
      db.tables[idx] = { ...db.tables[idx], ...rest } as CafeTable;
    }
  });
  return NextResponse.json(db.tables);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    db.tables = db.tables.filter(t => t.id !== id);
  });
  return NextResponse.json(db.tables);
}
