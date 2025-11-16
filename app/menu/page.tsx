"use client";
import { useEffect, useMemo, useState } from 'react';
import { InventoryItem, MenuItem } from '@/types';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<{ name: string; price: number; category: string; ing: { inventoryItemId: string; quantity: number }[] }>({ name: '', price: 0, category: 'Beverages', ing: [] });

  async function load() {
    const [m, inv] = await Promise.all([
      fetchJSON<MenuItem[]>('/api/menu'),
      fetchJSON<InventoryItem[]>('/api/inventory')
    ]);
    setMenu(m);
    setInventory(inv);
  }
  useEffect(()=>{ load(); }, []);

  function addIngredient() {
    if (!inventory.length) return;
    setForm(f => ({ ...f, ing: [...f.ing, { inventoryItemId: inventory[0].id, quantity: 1 }] }));
  }

  async function addMenu() {
    if (!form.name.trim() || !form.category) return;
    await fetchJSON('/api/menu', { method: 'POST', body: JSON.stringify({ name: form.name.trim(), price: Number(form.price), category: form.category, ingredients: form.ing }) });
    setForm({ name: '', price: 0, category: 'Beverages', ing: [] });
    await load();
  }

  async function remove(id: string) {
    await fetchJSON('/api/menu?id='+id, { method: 'DELETE' });
    await load();
  }

  const inventoryMap = useMemo(()=>new Map(inventory.map(i=>[i.id, i.name])),[inventory]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Add Menu Item</h2>
        <div className="space-y-2">
          <input className="input w-full" placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <div className="flex gap-2">
            <input type="number" className="input w-40" placeholder="Price" value={form.price} onChange={e=>setForm(f=>({...f,price:Number(e.target.value)}))} />
            <input className="input w-full" placeholder="Category" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Ingredients</div>
              <button className="btn btn-outline" onClick={addIngredient}>Add</button>
            </div>
            <div className="space-y-2">
              {form.ing.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <select className="input w-full" value={ing.inventoryItemId} onChange={e=>{
                    const v = e.target.value; setForm(f=>{ const next=[...f.ing]; next[idx] = { ...next[idx], inventoryItemId: v}; return { ...f, ing: next};});
                  }}>
                    {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                  </select>
                  <input type="number" className="input w-32" value={ing.quantity} onChange={e=>{
                    const v = Number(e.target.value); setForm(f=>{ const next=[...f.ing]; next[idx] = { ...next[idx], quantity: v}; return { ...f, ing: next};});
                  }} />
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={addMenu}>Add</button>
        </div>
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Menu</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {menu.map(m => (
            <div key={m.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-600">?{m.price} ? {m.category}</div>
                </div>
                <button className="text-red-600 text-sm" onClick={()=>remove(m.id)}>Delete</button>
              </div>
              {m.ingredients?.length ? (
                <ul className="text-xs text-gray-600 mt-2 list-disc ml-5">
                  {m.ingredients.map((ing, idx) => (
                    <li key={idx}>{inventoryMap.get(ing.inventoryItemId)} - {ing.quantity}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
