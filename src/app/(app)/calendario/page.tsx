import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { CalendarView } from '@/components/CalendarView';
import { NewAppointmentSheet } from '@/components/NewAppointmentSheet';

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const today = new Date();
  const [yearStr, monthStr] = (sp.month ?? '').split('-');
  const year = Number(yearStr) || today.getFullYear();
  const month = Number(monthStr) ? Number(monthStr) - 1 : today.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  // Cargar tareas con fecha límite + citas del mes
  const [{ data: tasks }, { data: appointments }, { data: orders }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date, area, status')
      .gte('due_date', monthStart.toISOString().slice(0, 10))
      .lte('due_date', monthEnd.toISOString().slice(0, 10)),
    supabase
      .from('appointments')
      .select('*')
      .gte('starts_at', monthStart.toISOString())
      .lte('starts_at', monthEnd.toISOString())
      .order('starts_at'),
    supabase.from('orders').select('id, reference, model').not('status', 'eq', 'cerrado'),
  ]);

  return (
    <div>
      <PageHeader
        title="Calendario"
        action={<NewAppointmentSheet orders={orders ?? []} />}
      />

      <div className="px-5 pt-4">
        <CalendarView
          year={year}
          month={month}
          tasks={tasks ?? []}
          appointments={appointments ?? []}
        />
      </div>
    </div>
  );
}
