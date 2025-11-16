import { promises as fs } from 'fs';
import path from 'path';
import { Database } from '@/types';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 12);

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'db.json');

async function ensureSeed() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    const seed: Database = {
      tables: [
        { id: nanoid(), name: 'T1', status: 'vacant' },
        { id: nanoid(), name: 'T2', status: 'vacant' },
        { id: nanoid(), name: 'T3', status: 'vacant' },
        { id: nanoid(), name: 'T4', status: 'vacant' }
      ],
      inventory: [
        { id: nanoid(), name: 'Coffee Beans', unit: 'g', stock: 3000 },
        { id: nanoid(), name: 'Milk', unit: 'ml', stock: 5000 },
        { id: nanoid(), name: 'Sugar', unit: 'g', stock: 2000 },
        { id: nanoid(), name: 'Flour', unit: 'g', stock: 5000 }
      ],
      menu: [],
      orders: [],
      kot: []
    };

    // Seed a simple menu referencing inventory by name lookup
    // We'll fill menu after inventory exists
    const coffeeBeansId = seed.inventory.find(i => i.name === 'Coffee Beans')!.id;
    const milkId = seed.inventory.find(i => i.name === 'Milk')!.id;
    const sugarId = seed.inventory.find(i => i.name === 'Sugar')!.id;

    seed.menu = [
      {
        id: nanoid(),
        name: 'Espresso',
        category: 'Beverages',
        price: 120,
        ingredients: [
          { inventoryItemId: coffeeBeansId, quantity: 18 },
        ]
      },
      {
        id: nanoid(),
        name: 'Cappuccino',
        category: 'Beverages',
        price: 180,
        ingredients: [
          { inventoryItemId: coffeeBeansId, quantity: 18 },
          { inventoryItemId: milkId, quantity: 150 },
          { inventoryItemId: sugarId, quantity: 5 },
        ]
      }
    ];

    await fs.writeFile(dbPath, JSON.stringify(seed, null, 2), 'utf-8');
  }
}

let writeLock: Promise<void> = Promise.resolve();

async function withLock(fn: () => Promise<void>) {
  const prev = writeLock;
  let resolveNext: (() => void) | null = null;
  writeLock = new Promise<void>((res) => { resolveNext = res; });
  try {
    await prev;
    await fn();
  } finally {
    resolveNext && resolveNext();
  }
}

export async function readDb(): Promise<Database> {
  await ensureSeed();
  const raw = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(raw) as Database;
}

export async function writeDb(update: (db: Database) => void | Database): Promise<Database> {
  await ensureSeed();
  let result!: Database;
  await withLock(async () => {
    const raw = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(raw) as Database;
    const maybe = update(db);
    const next = (maybe ? maybe : db) as Database;
    await fs.writeFile(dbPath, JSON.stringify(next, null, 2), 'utf-8');
    result = next;
  });
  return result;
}

export { nanoid };
