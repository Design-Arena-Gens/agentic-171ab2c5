import Link from 'next/link';

export default function Page() {
  const cards = [
    { href: '/waiter', title: 'Waiter Mode', desc: 'Punch orders quickly at tables' },
    { href: '/kitchen', title: 'KOT Display', desc: 'Realtime kitchen order tickets' },
    { href: '/tables', title: 'Table Management', desc: 'Manage tables and seating' },
    { href: '/menu', title: 'Menu & Recipes', desc: 'Manage menu, recipes & pricing' },
    { href: '/inventory', title: 'Inventory', desc: 'Track stock and deductions' },
    { href: '/orders', title: 'Orders', desc: 'View, settle and audit orders' },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg">{c.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
        </Link>
      ))}
    </div>
  );
}
