import { NextResponse } from 'next/server';
import { readDb, writeDb, nanoid } from '@/lib/db';
import { Order, OrderItem } from '@/types';
import { computeOrderTotal, createKOTFromOrder, deductInventoryForOrder } from '@/lib/logic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { tableId, tableName, items } = body as { tableId: string; tableName: string; items: OrderItem[] };
  if (!tableId || !tableName || !items?.length) return NextResponse.json({ error: 'table and items required' }, { status: 400 });
  const now = new Date().toISOString();
  const order: Order = {
    id: nanoid(),
    tableId,
    tableName,
    items,
    status: 'open',
    total: computeOrderTotal(items),
    createdAt: now,
  };
  const db = await writeDb((db) => {
    db.orders.unshift(order);
    const t = db.tables.find(t => t.id === tableId);
    if (t) {
      t.status = 'occupied';
      t.currentOrderId = order.id;
    }
  });
  return NextResponse.json(db.orders);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, status, items } = body as Partial<Order> & { id: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx >= 0) {
      if (items) {
        db.orders[idx].items = items;
        db.orders[idx].total = computeOrderTotal(items);
      }
      if (status) {
        db.orders[idx].status = status;
        if (status === 'sent') {
          const ticket = createKOTFromOrder(db.orders[idx]);
          db.kot.unshift(ticket);
        }
        if (status === 'paid') {
          const next = deductInventoryForOrder(db, db.orders[idx]);
          db.inventory = next.inventory;
          const t = db.tables.find(t => t.id === db.orders[idx].tableId);
          if (t) {
            t.status = 'vacant';
            delete t.currentOrderId;
          }
        }
      }
    }
  });
  return NextResponse.json(db.orders);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await writeDb((db) => {
    const ord = db.orders.find(o => o.id === id);
    db.orders = db.orders.filter(o => o.id !== id);
    if (ord) {
      const t = db.tables.find(t => t.id === ord.tableId);
      if (t) {
        t.status = 'vacant';
        delete t.currentOrderId;
      }
    }
  });
  return NextResponse.json(db.orders);
}
