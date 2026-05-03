import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Package, User, Trash2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { AreaBadge, PriorityBadge } from '@/components/Badges';
import { CommentSection } from '@/components/CommentSection';
import { StatusChanger } from '@/components/StatusChanger';
import { deleteTask } from '@/lib/actions/tasks';
import {
  smartDate,
  formatDateTime,
  isOverdue,
  initials,
  cn,
} from '@/lib/utils';

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name, role),
      creator:profiles!tasks_created_by_fkey(id, full_name),
      order:orders(id, reference, model, client:clients(full_name))
    `)
    .eq('id', id)
    .single();

  if (!task) notFound();

  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:profiles(id, full_name)')
    .eq('task_id', id)
    .order('created_at', { ascending: true });

  const overdue = isOverdue(task.due_date, task.status);

  async function handleDelete() {
    'use server';
    await deleteTask(id);
  }

  return (
    <div>
      <PageHeader title="Tarea" back="/tareas" />

      <div className="px-5 pt-5 space-y-5">
        {/* Cabecera de la tarea */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className={cn(
              'font-display text-xl font-medium leading-tight flex-1',
              task.status === 'hecha' && 'line-through text-muted'
            )}>
              {task.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <AreaBadge area={task.area} />
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed mb-4">
              {task.description}
            </p>
          )}

          <div className="space-y-2 text-sm border-t border-border pt-4">
            {task.due_date && (
              <Field
                icon={overdue ? <AlertCircle className="w-4 h-4 text-danger" /> : <Calendar className="w-4 h-4" />}
                label="Fecha límite"
                value={
                  <span className={overdue ? 'text-danger font-medium' : ''}>
                    {smartDate(task.due_date)}
                    {overdue && ' (vencida)'}
                  </span>
                }
              />
            )}
            {task.assignee && (
              <Field
                icon={
                  <div className="w-5 h-5 rounded-full bg-ink text-bg flex items-center justify-center text-[9px] font-semibold">
                    {initials(task.assignee.full_name)}
                  </div>
                }
                label="Asignada a"
                value={task.assignee.full_name}
              />
            )}
            {task.order && (
              <Field
                icon={<Package className="w-4 h-4" />}
                label="Pedido"
                value={
                  <Link
                    href={`/pedidos/${task.order.id}`}
                    className="text-ink hover:underline"
                  >
                    {task.order.reference} · {task.order.model}
                    {task.order.client && ` · ${task.order.client.full_name}`}
                  </Link>
                }
              />
            )}
            {task.creator && (
              <Field
                icon={<User className="w-4 h-4" />}
                label="Creada por"
                value={`${task.creator.full_name} · ${formatDateTime(task.created_at)}`}
              />
            )}
          </div>
        </div>

        {/* Cambiar estado */}
        <StatusChanger taskId={task.id} currentStatus={task.status} />

        {/* Comentarios */}
        <CommentSection taskId={task.id} comments={comments ?? []} />

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Link href={`/tareas/${task.id}/editar`} className="btn-secondary flex-1">
            Editar
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="btn-secondary text-danger hover:bg-danger/10"
              title="Eliminar tarea"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-ink truncate">{value}</div>
      </div>
    </div>
  );
}
