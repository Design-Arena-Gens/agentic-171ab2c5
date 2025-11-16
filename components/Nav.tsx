"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/waiter', label: 'Waiter' },
  { href: '/kitchen', label: 'KOT' },
  { href: '/tables', label: 'Tables' },
  { href: '/menu', label: 'Menu' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/orders', label: 'Orders' }
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b bg-white">
      <div className="container-px max-w-7xl mx-auto flex items-center justify-between py-3">
        <Link href="/" className="font-semibold text-brand-700">Cafe POS</Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 whitespace-nowrap',
                pathname === l.href && 'bg-gray-100 text-gray-900'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
