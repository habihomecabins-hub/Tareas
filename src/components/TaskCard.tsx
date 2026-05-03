import Link from 'next/link';
import { Calendar, MessageCircle, Package, AlertCircle } from 'lucide-react';
import { cn, smartDate, isOverdue, initials } from '@/lib/utils';
import { AreaBadge, StatusBadge, PriorityBadge } from './Badges';
import type { TaskWithRelations } from '@/lib/types';

export function TaskCard({ task }: { task: TaskWithRelations }) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <Link
      href={`/tareas/${task.id}`}
      className="block card p-4 hover:shadow-lift transition-shadow active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className={cn(
            'font-medium text-ink leading-snug flex-1',
            task.status === 'hecha' && 'line-through text-muted'
          )}
        >
          {task.title}
        </h3>
        {task.assignee && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-ink text-bg flex items-center justify-center text-[10px] font-semibold">
            {initials(task.assignee.full_name)}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-muted line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <AreaBadge area={task.area} />
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                overdue && 'text-danger font-medium'
              )}
            >
              {overdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              {smartDate(task.due_date)}
            </span>
          )}
          {task.order && (
            <span className="inline-flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {task.order.reference}
            </span>
          )}
        </div>
        {(task.comment_count ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {task.comment_count}
          </span>
        )}
      </div>
    </Link>
  );
}
