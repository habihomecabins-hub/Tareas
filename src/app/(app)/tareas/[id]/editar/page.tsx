import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { updateTask } from '@/lib/actions/tasks';
import {
  TASK_AREA_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type TaskArea,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/types';

export default async function EditarTareaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: task }, { data: profiles }, { data: orders }] = await Promise.all([
    supabase.from('tasks').select('*').eq('id', id).single(),
    supabase.from('profiles').select('id, full_name').eq('active', true).order('full_name'),
    supabase
      .from('orders')
      .select('id, reference, model')
      .not('status', 'in', '(cerrado)')
      .order('created_at', { ascending: false }),
  ]);

  if (!task) notFound();

  async function action(formData: FormData) {
    'use server';
    await updateTask(id, formData);
  }

  return (
    <div>
      <PageHeader title="Editar tarea" back={`/tareas/${id}`} />

      <form action={action} className="px-5 pt-5 space-y-5 pb-10">
        <div>
          <label className="label">Título *</label>
          <input
            name="title"
            type="text"
            required
            defaultValue={task.title}
            className="input"
          />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={task.description ?? ''}
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Área *</label>
            <select name="area" defaultValue={task.area} className="input" required>
              {(Object.keys(TASK_AREA_LABEL) as TaskArea[]).map((a) => (
                <option key={a} value={a}>{TASK_AREA_LABEL[a]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Prioridad</label>
            <select name="priority" defaultValue={task.priority} className="input">
              {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Estado</label>
          <select name="status" defaultValue={task.status} className="input">
            {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Asignar a</label>
          <select name="assignee_id" defaultValue={task.assignee_id ?? ''} className="input">
            <option value="">Sin asignar</option>
            {(profiles ?? []).map((p: any) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Pedido relacionado</label>
          <select name="order_id" defaultValue={task.order_id ?? ''} className="input">
            <option value="">Ninguno</option>
            {(orders ?? []).map((o: any) => (
              <option key={o.id} value={o.id}>
                {o.reference} · {o.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Fecha límite</label>
          <input
            name="due_date"
            type="date"
            defaultValue={task.due_date ?? ''}
            className="input"
          />
        </div>

        <div className="pt-3">
          <button type="submit" className="btn-primary w-full">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
