import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CheckSquare, Calendar, Package, Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { TaskCard } from '@/components/TaskCard';
import { smartDate } from '@/lib/utils';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  // Mis tareas pendientes
  const { data: myTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name),
      order:orders(id, reference, model)
    `)
    .eq('assignee_id', user.id)
    .neq('status', 'hecha')
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(5);

  // Stats
  const { count: totalPending } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'hecha');

  const { count: ordersInProgress } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['confirmado', 'en_produccion', 'listo_entrega']);

  // Próximas citas
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(3);

  return (
    <div>
      <PageHeader
        title={`Hola, ${profile?.full_name?.split(' ')[0] ?? ''}`}
        subtitle={smartDate(new Date()) + ' · ' + new Date().toLocaleDateString('es-ES', { weekday: 'long' })}
      />

      <div className="px-5 pt-5 space-y-6">
        {/* Stats rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/tareas" className="card p-4 hover:shadow-lift transition-shadow">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <CheckSquare className="w-4 h-4" /> TAREAS PENDIENTES
            </div>
            <div className="font-display text-3xl font-semibold">{totalPending ?? 0}</div>
          </Link>
          <Link href="/pedidos" className="card p-4 hover:shadow-lift transition-shadow">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Package className="w-4 h-4" /> PEDIDOS ACTIVOS
            </div>
            <div className="font-display text-3xl font-semibold">{ordersInProgress ?? 0}</div>
          </Link>
        </div>

        {/* Mis tareas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-medium">Mis tareas</h2>
            <Link href="/tareas" className="text-sm text-muted hover:text-ink">
              Ver todas →
            </Link>
          </div>
          {myTasks && myTasks.length > 0 ? (
            <div className="space-y-2.5">
              {myTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-muted text-sm">
              No tienes tareas asignadas. ¡Bien hecho!
            </div>
          )}
        </section>

        {/* Próximas citas */}
        {upcomingAppointments && upcomingAppointments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-medium">Próximas citas</h2>
              <Link href="/calendario" className="text-sm text-muted hover:text-ink">
                Calendario →
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="card p-3.5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-2 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] uppercase text-muted font-semibold">
                      {new Date(a.starts_at).toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                    <span className="font-display font-semibold leading-none">
                      {new Date(a.starts_at).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{a.title}</div>
                    <div className="text-xs text-muted">
                      {new Date(a.starts_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {a.location && ` · ${a.location}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Link
          href="/tareas/nueva"
          className="btn-primary w-full"
        >
          <Plus className="w-4 h-4" /> Nueva tarea
        </Link>
      </div>
    </div>
  );
}
