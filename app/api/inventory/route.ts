import { NextResponse } from 'next/server';
import { readDb, writeDb, nanoid } from '@/lib/db';
import { InventoryItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.inventory);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, unit, stock } = body as Partial<InventoryItem>;
  if (!name || !unit) return NextResponse.json({ error: 'name, unit required' }, { status: 400 });
  const db = await writeDb((db) => {
    const i: InventoryItem = { id: nanoid(), name, unit, stock: Number(stock ?? 0) };
    db.inventory.push(i);
  });
  return NextResponse.json(db.inventory);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...rest } = body as Partial<InventoryItem> & { id: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    const idx = db.inventory.findIndex(i => i.id === id);
    if (idx >= 0) db.inventory[idx] = { ...db.inventory[idx], ...rest } as InventoryItem;
  });
  return NextResponse.json(db.inventory);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    db.inventory = db.inventory.filter(i => i.id !== id);
  });
  return NextResponse.json(db.inventory);
}
