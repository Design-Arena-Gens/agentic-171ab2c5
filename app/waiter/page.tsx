"use client";
import { useEffect, useMemo, useState } from 'react';
import { CafeTable, MenuItem, OrderItem, Order } from '@/types';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function WaiterPage() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<CafeTable | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    (async () => {
      const [t, m] = await Promise.all([
        fetchJSON<CafeTable[]>('/api/tables'),
        fetchJSON<MenuItem[]>('/api/menu')
      ]);
      setTables(t);
      setMenu(m);
    })();
  }, []);

  const categories = useMemo(() => Array.from(new Set(menu.map(m => m.category))), [menu]);

  function addToCart(m: MenuItem) {
    setCart(prev => {
      const idx = prev.findIndex(p => p.menuItemId === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { menuItemId: m.id, name: m.name, price: m.price, qty: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    setCart(prev => prev.map(p => p.menuItemId === id ? { ...p, qty: Math.max(1, qty) } : p));
  }

  function removeItem(id: string) {
    setCart(prev => prev.filter(p => p.menuItemId !== id));
  }

  const total = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  async function createOrder(status?: Order['status']) {
    if (!selectedTable || cart.length === 0) return;
    const orderList = await fetchJSON<Order[]>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ tableId: selectedTable.id, tableName: selectedTable.name, items: cart })
    });
    const created = orderList[0];
    if (status && status !== 'open') {
      await fetchJSON<Order[]>('/api/orders', { method: 'PUT', body: JSON.stringify({ id: created.id, status }) });
    }
    setCart([]);
    const t = await fetchJSON<CafeTable[]>('/api/tables');
    setTables(t);
    alert('Order placed' + (status === 'sent' ? ' & sent to kitchen' : ''));
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="card p-4">
        <h2 className="font-semibold mb-3">Tables</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {tables.map(t => (
            <button key={t.id} onClick={() => setSelectedTable(t)} className={`btn border ${selectedTable?.id===t.id?'bg-brand-50 border-brand-300':'bg-white'} `}>
              <div className="text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-gray-600">{t.status}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-semibold mb-3">Cart {selectedTable ? `- ${selectedTable.name}` : ''}</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm">Add items from menu</p>
        ) : (
          <div className="space-y-2">
            {cart.map(i => (
              <div key={i.menuItemId} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-gray-600">?{i.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" className="input w-16" value={i.qty} onChange={e=>updateQty(i.menuItemId, Number(e.target.value))} />
                  <button className="btn btn-outline" onClick={()=>removeItem(i.menuItemId)}>Remove</button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <div className="font-semibold">Total</div>
              <div className="font-semibold">?{total}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={!selectedTable || cart.length===0} className="btn btn-outline" onClick={()=>createOrder('open')}>Save</button>
              <button disabled={!selectedTable || cart.length===0} className="btn btn-primary" onClick={()=>createOrder('sent')}>Send to Kitchen</button>
            </div>
          </div>
        )}
      </section>

      <section className="card p-4 lg:col-span-2">
        <h2 className="font-semibold mb-3">Menu</h2>
        <div className="flex gap-2 overflow-x-auto mb-3">
          {categories.map(c => <span key={c} className="badge bg-gray-100">{c}</span>)}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {menu.map(m => (
            <button key={m.id} onClick={()=>addToCart(m)} className="card p-4 text-left">
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-gray-600">?{m.price} ? {m.category}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
