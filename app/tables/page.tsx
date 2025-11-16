"use client";
import { useEffect, useState } from 'react';
import { CafeTable } from '@/types';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function TablesPage() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const t = await fetchJSON<CafeTable[]>('/api/tables');
    setTables(t);
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    if (!name.trim()) return;
    await fetchJSON('/api/tables', { method: 'POST', body: JSON.stringify({ name: name.trim() }) });
    setName('');
    await load();
  }

  async function remove(id: string) {
    await fetchJSON('/api/tables?id='+id, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Add Table</h2>
        <div className="flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Table name" className="input w-full" />
          <button onClick={add} className="btn btn-primary">Add</button>
        </div>
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Tables</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {tables.map(t => (
            <div key={t.id} className="p-3 border rounded-md flex items-center justify-between">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-gray-600">{t.status}</div>
              </div>
              <button onClick={()=>remove(t.id)} className="text-red-600 text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
