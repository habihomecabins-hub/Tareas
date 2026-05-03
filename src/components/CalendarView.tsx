'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppointmentKindBadge, AreaBadge } from './Badges';
import type { TaskArea, AppointmentKind } from '@/lib/types';

interface CalTask {
  id: string;
  title: string;
  due_date: string | null;
  area: TaskArea;
  status: string;
}
interface CalAppointment {
  id: string;
  title: string;
  kind: AppointmentKind;
  starts_at: string;
  ends_at: string;
  location: string | null;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CalendarView({
  year,
  month,
  tasks,
  appointments,
}: {
  year: number;
  month: number;
  tasks: CalTask[];
  appointments: CalAppointment[];
}) {
  const router = useRouter();
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null
  );

  const monthStart = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Lunes = 0
  const startWeekday = (monthStart.getDay() + 6) % 7;

  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    router.push(`/calendario?month=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  // Indexar eventos por día
  const dayItems: Record<number, { tasks: CalTask[]; appts: CalAppointment[] }> = {};
  for (const t of tasks) {
    if (!t.due_date) continue;
    const d = new Date(t.due_date).getDate();
    dayItems[d] ??= { tasks: [], appts: [] };
    dayItems[d].tasks.push(t);
  }
  for (const a of appointments) {
    const d = new Date(a.starts_at).getDate();
    dayItems[d] ??= { tasks: [], appts: [] };
    dayItems[d].appts.push(a);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedItems = selectedDay ? dayItems[selectedDay] : null;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={() => changeMonth(-1)} className="btn-ghost !p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/calendario')}
              className="text-xs text-muted hover:text-ink px-2"
            >
              Hoy
            </button>
            <button onClick={() => changeMonth(1)} className="btn-ghost !p-2">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-muted font-semibold uppercase pb-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;
            const isSelected = selectedDay === day;
            const items = dayItems[day];
            const dotCount = (items?.tasks.length ?? 0) + (items?.appts.length ?? 0);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-1 transition-all',
                  'hover:bg-surface-2',
                  isSelected && 'bg-ink text-bg hover:bg-ink',
                  !isSelected && isToday && 'ring-1 ring-ink/40 font-semibold',
                )}
              >
                <span>{day}</span>
                {dotCount > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(dotCount, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1 h-1 rounded-full',
                          isSelected ? 'bg-bg' : 'bg-ink/60'
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del día */}
      {selectedDay && (
        <div>
          <h3 className="font-display text-base font-medium mb-3 px-1">
            {selectedDay} de {MONTHS[month]}
          </h3>
          <div className="space-y-2">
            {selectedItems?.appts.map((a) => (
              <div key={a.id} className="card p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm">{a.title}</div>
                  <AppointmentKindBadge kind={a.kind} />
                </div>
                <div className="text-xs text-muted">
                  {new Date(a.starts_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' – '}
                  {new Date(a.ends_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {a.location && ` · ${a.location}`}
                </div>
              </div>
            ))}
            {selectedItems?.tasks.map((t) => (
              <Link key={t.id} href={`/tareas/${t.id}`} className="block card p-3.5 hover:shadow-lift transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className={cn('font-medium text-sm', t.status === 'hecha' && 'line-through text-muted')}>
                    {t.title}
                  </div>
                  <AreaBadge area={t.area} />
                </div>
                <div className="text-xs text-muted">Tarea con vencimiento</div>
              </Link>
            ))}
            {!selectedItems && (
              <div className="card p-6 text-center text-muted text-sm">
                Sin eventos ni tareas en este día
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
