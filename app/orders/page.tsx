"use client";
import { useEffect, useState } from 'react';
import { Order } from '@/types';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  async function load() {
    const o = await fetchJSON<Order[]>('/api/orders');
    setOrders(o);
  }
  useEffect(()=>{ load(); }, []);

  async function setStatus(id: string, status: Order['status']) {
    await fetchJSON('/api/orders', { method: 'PUT', body: JSON.stringify({ id, status }) });
    await load();
  }

  async function remove(id: string) {
    await fetchJSON('/api/orders?id='+id, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="card p-4">
      <h2 className="font-semibold mb-3">Orders</h2>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{o.tableName}</div>
              <div className="text-sm">?{o.total}</div>
            </div>
            <div className="text-xs text-gray-600">{new Date(o.createdAt).toLocaleString()} ? {o.status}</div>
            <ul className="text-sm mt-2 list-disc ml-5">
              {o.items.map((i, idx) => <li key={idx}>{i.name} x{i.qty}</li>)}
            </ul>
            <div className="flex gap-2 mt-2">
              {o.status !== 'sent' && <button className="btn btn-outline" onClick={()=>setStatus(o.id,'sent')}>Send to Kitchen</button>}
              {o.status !== 'paid' && <button className="btn btn-primary" onClick={()=>setStatus(o.id,'paid')}>Mark Paid</button>}
              <button className="text-red-600 text-sm" onClick={()=>remove(o.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
