'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Calendar, Package, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/tareas', label: 'Tareas', icon: CheckSquare },
  { href: '/calendario', label: 'Agenda', icon: Calendar },
  { href: '/pedidos', label: 'Pedidos', icon: Package },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="max-w-2xl mx-auto px-2 py-2 flex items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg flex-1 transition-colors',
                active ? 'text-ink' : 'text-muted hover:text-ink'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'stroke-[2.4]')} />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
