import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { createTask } from '@/lib/actions/tasks';
import {
  TASK_AREA_LABEL,
  TASK_PRIORITY_LABEL,
  type TaskArea,
  type TaskPriority,
} from '@/lib/types';

export default async function NuevaTareaPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').eq('active', true).order('full_name'),
    supabase
      .from('orders')
      .select('id, reference, model')
      .not('status', 'in', '(cerrado,entregado)')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader title="Nueva tarea" back="/tareas" />

      <form action={createTask} className="px-5 pt-5 space-y-5 pb-10">
        <div>
          <label className="label">Título *</label>
          <input
            name="title"
            type="text"
            required
            className="input"
            placeholder="Ej: Montar paneles laterales casa Modelo Atlas"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            rows={3}
            className="input resize-none"
            placeholder="Detalles, materiales, observaciones…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Área *</label>
            <select name="area" defaultValue="taller" className="input" required>
              {(Object.keys(TASK_AREA_LABEL) as TaskArea[]).map((a) => (
                <option key={a} value={a}>
                  {TASK_AREA_LABEL[a]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Prioridad</label>
            <select name="priority" defaultValue="normal" className="input">
              {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Asignar a</label>
          <select name="assignee_id" className="input">
            <option value="">Sin asignar</option>
            {(profiles ?? []).map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Pedido relacionado</label>
          <select name="order_id" className="input">
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
          <input name="due_date" type="date" className="input" />
        </div>

        <div className="pt-3">
          <button type="submit" className="btn-primary w-full">
            Crear tarea
          </button>
        </div>
      </form>
    </div>
  );
}
