"use client";
import { useEffect, useMemo, useState } from 'react';
import { KOTTicket } from '@/types';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function KitchenPage() {
  const [tickets, setTickets] = useState<KOTTicket[]>([]);
  const [filter, setFilter] = useState<'all' | KOTTicket['status']>('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const t = await fetchJSON<KOTTicket[]>('/api/kot');
      if (mounted) setTickets(t);
    };
    load();
    const id = setInterval(load, 4000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const filtered = useMemo(() => filter === 'all' ? tickets : tickets.filter(t => t.status === filter), [tickets, filter]);

  async function updateStatus(id: string, status: KOTTicket['status']) {
    const t = await fetchJSON<KOTTicket[]>('/api/kot', { method: 'PUT', body: JSON.stringify({ id, status }) });
    setTickets(t);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">KOT Display</h1>
        <div className="flex gap-2">
          {['all','queued','preparing','ready','served'].map(s => (
            <button key={s} onClick={()=>setFilter(s as any)} className={`btn btn-outline ${filter===s?'bg-gray-100':''}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(t => (
          <div key={t.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{t.tableName}</div>
              <span className={`badge status-${t.status}`}>{t.status}</span>
            </div>
            <ul className="text-sm space-y-1">
              {t.items.map((i, idx) => (
                <li key={idx} className="flex justify-between"><span>{i.name}</span><span>x{i.qty}</span></li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-3">
              {t.status !== 'preparing' && <button className="btn btn-outline" onClick={()=>updateStatus(t.id,'preparing')}>Preparing</button>}
              {t.status !== 'ready' && <button className="btn btn-outline" onClick={()=>updateStatus(t.id,'ready')}>Ready</button>}
              {t.status !== 'served' && <button className="btn btn-primary" onClick={()=>updateStatus(t.id,'served')}>Served</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
