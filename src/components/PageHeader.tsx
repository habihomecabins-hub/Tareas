import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, back, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-bg/85 backdrop-blur-lg border-b border-border safe-top',
        className
      )}
    >
      <div className="max-w-2xl mx-auto px-5 pt-3 pb-4 flex items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          {back && (
            <Link
              href={back}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-1 -ml-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </Link>
          )}
          <h1 className="font-display text-2xl font-semibold text-ink truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5 truncate">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
