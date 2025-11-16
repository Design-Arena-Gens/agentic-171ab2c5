import { Database, ID, InventoryItem, KOTTicket, MenuItem, Order, OrderItem } from '@/types';
import { nanoid } from './db';

export function computeOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}

export function createKOTFromOrder(order: Order): KOTTicket {
  const ticket: KOTTicket = {
    id: nanoid(),
    orderId: order.id,
    tableName: order.tableName,
    items: order.items.map((it) => ({ name: it.name, qty: it.qty, notes: it.notes })),
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  return ticket;
}

export function deductInventoryForOrder(db: Database, order: Order): Database {
  // Build a map from menu item id to menu item for ingredients
  const menuById = new Map<string, MenuItem>(db.menu.map(m => [m.id, m]));
  const invById = new Map<string, InventoryItem>(db.inventory.map(i => [i.id, i]));

  for (const oi of order.items) {
    const menu = menuById.get(oi.menuItemId);
    if (!menu || !menu.ingredients) continue;
    for (const ing of menu.ingredients) {
      const inv = invById.get(ing.inventoryItemId);
      if (!inv) continue;
      inv.stock = Math.max(0, inv.stock - ing.quantity * oi.qty);
    }
  }

  return {
    ...db,
    inventory: Array.from(invById.values()),
  };
}
