import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { TaskCard } from '@/components/TaskCard';
import { TASK_AREA_LABEL, type TaskArea, type TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchParams {
  area?: TaskArea;
  status?: TaskStatus;
  mine?: string;
}

const AREAS: (TaskArea | 'todas')[] = ['todas', 'taller', 'entrega', 'postventa', 'oficina'];

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name),
      order:orders(id, reference, model)
    `)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: false });

  if (sp.area && sp.area !== ('todas' as TaskArea)) query = query.eq('area', sp.area);
  if (sp.status) query = query.eq('status', sp.status);
  if (sp.mine === '1' && user) query = query.eq('assignee_id', user.id);

  const { data: tasks } = await query;

  // Contar comentarios por tarea (consulta agregada)
  const taskIds = tasks?.map((t) => t.id) ?? [];
  let commentCounts: Record<string, number> = {};
  if (taskIds.length > 0) {
    const { data: comments } = await supabase
      .from('comments')
      .select('task_id')
      .in('task_id', taskIds);
    commentCounts = (comments ?? []).reduce<Record<string, number>>((acc, c: any) => {
      acc[c.task_id] = (acc[c.task_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  const enriched = (tasks ?? []).map((t) => ({
    ...t,
    comment_count: commentCounts[t.id] ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title="Tareas"
        subtitle={`${enriched.length} ${enriched.length === 1 ? 'tarea' : 'tareas'}`}
        action={
          <Link href="/tareas/nueva" className="btn-primary !py-2 !px-3">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </Link>
        }
      />

      {/* Filtros */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-thin">
          <FilterChip href="/tareas?mine=1" active={sp.mine === '1'}>
            Solo mías
          </FilterChip>
          {AREAS.map((a) => (
            <FilterChip
              key={a}
              href={a === 'todas' ? '/tareas' : `/tareas?area=${a}`}
              active={(sp.area ?? 'todas') === a && sp.mine !== '1'}
            >
              {a === 'todas' ? 'Todas' : TASK_AREA_LABEL[a as TaskArea]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="px-5 pt-2 space-y-2.5">
        {enriched.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted text-sm mb-4">No hay tareas con estos filtros</p>
            <Link href="/tareas/nueva" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Crear primera tarea
            </Link>
          </div>
        ) : (
          enriched.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors',
        active
          ? 'bg-ink text-bg border-ink'
          : 'bg-surface text-muted border-border hover:text-ink'
      )}
    >
      {children}
    </Link>
  );
}
