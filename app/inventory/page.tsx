"use client";
import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<{ name: string; unit: string; stock: number }>({ name: '', unit: 'g', stock: 0 });

  async function load() {
    const inv = await fetchJSON<InventoryItem[]>('/api/inventory');
    setItems(inv);
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    if (!form.name.trim() || !form.unit) return;
    await fetchJSON('/api/inventory', { method: 'POST', body: JSON.stringify(form) });
    setForm({ name: '', unit: 'g', stock: 0 });
    await load();
  }

  async function updateStock(id: string, stock: number) {
    await fetchJSON('/api/inventory', { method: 'PUT', body: JSON.stringify({ id, stock }) });
    await load();
  }

  async function remove(id: string) {
    await fetchJSON('/api/inventory?id='+id, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Add Inventory Item</h2>
        <div className="space-y-2">
          <input className="input w-full" placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <div className="flex gap-2">
            <input className="input w-40" placeholder="Unit (g/ml/pcs)" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} />
            <input type="number" className="input w-40" placeholder="Stock" value={form.stock} onChange={e=>setForm(f=>({...f,stock:Number(e.target.value)}))} />
          </div>
          <button className="btn btn-primary" onClick={add}>Add</button>
        </div>
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Inventory</h2>
        <div className="space-y-2">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between border rounded-md p-2">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-gray-600">{i.unit}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" className="input w-28" value={i.stock} onChange={e=>updateStock(i.id, Number(e.target.value))} />
                <button className="text-red-600 text-sm" onClick={()=>remove(i.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
