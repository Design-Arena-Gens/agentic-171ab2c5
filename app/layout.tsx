import './globals.css';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Cafe POS',
  description: 'Modern POS for Cafe with KOT & Waiter Mode',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={cn('min-h-full antialiased')}> 
        <div className="min-h-screen grid grid-rows-[auto,1fr]">
          <Nav />
          <main className="container-px py-6 max-w-7xl mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
