import { cn } from '@/lib/utils';
import {
  TASK_AREA_LABEL,
  TASK_STATUS_LABEL,
  TASK_PRIORITY_LABEL,
  ORDER_STATUS_LABEL,
  APPOINTMENT_KIND_LABEL,
  type TaskArea,
  type TaskStatus,
  type TaskPriority,
  type OrderStatus,
  type AppointmentKind,
} from '@/lib/types';

const areaStyles: Record<TaskArea, string> = {
  taller: 'bg-taller/10 text-taller border-taller/20',
  entrega: 'bg-entrega/10 text-entrega border-entrega/20',
  postventa: 'bg-postventa/10 text-postventa border-postventa/20',
  oficina: 'bg-muted/15 text-muted border-muted/20',
};

const statusStyles: Record<TaskStatus, string> = {
  pendiente: 'bg-surface-2 text-muted border-border',
  en_curso: 'bg-warning/15 text-warning border-warning/30',
  bloqueada: 'bg-danger/10 text-danger border-danger/20',
  hecha: 'bg-success/15 text-success border-success/30',
};

const priorityStyles: Record<TaskPriority, string> = {
  baja: 'bg-surface-2 text-muted',
  normal: 'bg-surface-2 text-ink',
  alta: 'bg-warning/15 text-warning',
  urgente: 'bg-danger/15 text-danger',
};

const orderStatusStyles: Record<OrderStatus, string> = {
  presupuesto: 'bg-surface-2 text-muted border-border',
  confirmado: 'bg-warning/15 text-warning border-warning/30',
  en_produccion: 'bg-taller/15 text-taller border-taller/30',
  listo_entrega: 'bg-entrega/15 text-entrega border-entrega/30',
  entregado: 'bg-success/15 text-success border-success/30',
  postventa: 'bg-postventa/15 text-postventa border-postventa/30',
  cerrado: 'bg-ink/10 text-ink border-ink/20',
};

const apptKindStyles: Record<AppointmentKind, string> = {
  entrega: 'bg-entrega/15 text-entrega',
  visita: 'bg-warning/15 text-warning',
  reunion: 'bg-ink/10 text-ink',
  postventa: 'bg-postventa/15 text-postventa',
  otro: 'bg-surface-2 text-muted',
};

export function AreaBadge({ area }: { area: TaskArea }) {
  return (
    <span className={cn('badge border', areaStyles[area])}>{TASK_AREA_LABEL[area]}</span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn('badge border', statusStyles[status])}>{TASK_STATUS_LABEL[status]}</span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === 'normal') return null;
  return (
    <span className={cn('badge', priorityStyles[priority])}>
      {priority === 'urgente' && '!'} {TASK_PRIORITY_LABEL[priority]}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('badge border', orderStatusStyles[status])}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function AppointmentKindBadge({ kind }: { kind: AppointmentKind }) {
  return <span className={cn('badge', apptKindStyles[kind])}>{APPOINTMENT_KIND_LABEL[kind]}</span>;
}
