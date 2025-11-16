export type ID = string;

export type TableStatus = 'vacant' | 'occupied';
export interface CafeTable {
  id: ID;
  name: string;
  status: TableStatus;
  currentOrderId?: ID;
}

export interface InventoryItem {
  id: ID;
  name: string;
  unit: string; // e.g., g, ml, pcs
  stock: number; // current stock
}

export interface RecipeIngredient {
  inventoryItemId: ID;
  quantity: number; // per 1 menu item
}

export interface MenuItem {
  id: ID;
  name: string;
  category: string;
  price: number;
  ingredients?: RecipeIngredient[];
}

export interface OrderItem {
  menuItemId: ID;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

export type OrderStatus = 'open' | 'sent' | 'paid' | 'cancelled';
export interface Order {
  id: ID;
  tableId: ID;
  tableName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export type KOTStatus = 'queued' | 'preparing' | 'ready' | 'served';
export interface KOTTicketItem {
  name: string;
  qty: number;
  notes?: string;
}
export interface KOTTicket {
  id: ID;
  orderId: ID;
  tableName: string;
  items: KOTTicketItem[];
  status: KOTStatus;
  createdAt: string;
}

export interface Database {
  tables: CafeTable[];
  inventory: InventoryItem[];
  menu: MenuItem[];
  orders: Order[];
  kot: KOTTicket[];
}
