'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateTaskStatus } from '@/lib/actions/tasks';
import { TASK_STATUS_LABEL, type TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statuses: TaskStatus[] = ['pendiente', 'en_curso', 'bloqueada', 'hecha'];

const statusButtonStyle: Record<TaskStatus, string> = {
  pendiente: 'data-[active=true]:bg-surface-2 data-[active=true]:text-ink',
  en_curso: 'data-[active=true]:bg-warning/15 data-[active=true]:text-warning',
  bloqueada: 'data-[active=true]:bg-danger/10 data-[active=true]:text-danger',
  hecha: 'data-[active=true]:bg-success/15 data-[active=true]:text-success',
};

export function StatusChanger({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: TaskStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(status: TaskStatus) {
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-muted uppercase tracking-wide">Estado</div>
        {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted" />}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            data-active={s === currentStatus}
            disabled={pending}
            onClick={() => handleChange(s)}
            className={cn(
              'px-3 py-2.5 rounded-lg text-sm font-medium border border-border',
              'text-muted bg-surface hover:text-ink transition-colors',
              'disabled:opacity-60',
              statusButtonStyle[s]
            )}
          >
            {TASK_STATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
