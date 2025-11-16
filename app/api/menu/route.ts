import { NextResponse } from 'next/server';
import { readDb, writeDb, nanoid } from '@/lib/db';
import { MenuItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.menu);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, price, category, ingredients } = body as Partial<MenuItem>;
  if (!name || price == null || !category)
    return NextResponse.json({ error: 'name, price, category required' }, { status: 400 });
  const db = await writeDb((db) => {
    const m: MenuItem = { id: nanoid(), name, price: Number(price), category, ingredients: ingredients || [] };
    db.menu.push(m);
  });
  return NextResponse.json(db.menu);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...rest } = body as Partial<MenuItem> & { id: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    const idx = db.menu.findIndex(m => m.id === id);
    if (idx >= 0) db.menu[idx] = { ...db.menu[idx], ...rest } as MenuItem;
  });
  return NextResponse.json(db.menu);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    db.menu = db.menu.filter(m => m.id !== id);
  });
  return NextResponse.json(db.menu);
}
