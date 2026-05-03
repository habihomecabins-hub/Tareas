// Tipos generados manualmente. Para regenerar automáticamente con la CLI de Supabase:
// npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/types.ts

export type UserRole = 'admin' | 'taller' | 'logistica' | 'postventa';

export type OrderStatus =
  | 'presupuesto'
  | 'confirmado'
  | 'en_produccion'
  | 'listo_entrega'
  | 'entregado'
  | 'postventa'
  | 'cerrado';

export type TaskArea = 'taller' | 'entrega' | 'postventa' | 'oficina';
export type TaskStatus = 'pendiente' | 'en_curso' | 'bloqueada' | 'hecha';
export type TaskPriority = 'baja' | 'normal' | 'alta' | 'urgente';
export type AppointmentKind = 'entrega' | 'visita' | 'reunion' | 'postventa' | 'otro';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Order {
  id: string;
  reference: string;
  client_id: string | null;
  model: string;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_date: string | null;
  status: OrderStatus;
  price_eur: number | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  area: TaskArea;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  order_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  kind: AppointmentKind;
  starts_at: string;
  ends_at: string;
  location: string | null;
  order_id: string | null;
  task_id: string | null;
  attendees: string[];
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

// Tipos extendidos con joins
export interface TaskWithRelations extends Task {
  assignee?: Pick<Profile, 'id' | 'full_name'> | null;
  order?: Pick<Order, 'id' | 'reference' | 'model'> | null;
  comment_count?: number;
}

export interface OrderWithClient extends Order {
  client?: Pick<Client, 'id' | 'full_name' | 'phone'> | null;
}

// Etiquetas legibles en español
export const TASK_AREA_LABEL: Record<TaskArea, string> = {
  taller: 'Taller',
  entrega: 'Entrega',
  postventa: 'Postventa',
  oficina: 'Oficina',
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  bloqueada: 'Bloqueada',
  hecha: 'Hecha',
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  presupuesto: 'Presupuesto',
  confirmado: 'Confirmado',
  en_produccion: 'En producción',
  listo_entrega: 'Listo para entrega',
  entregado: 'Entregado',
  postventa: 'Postventa',
  cerrado: 'Cerrado',
};

export const APPOINTMENT_KIND_LABEL: Record<AppointmentKind, string> = {
  entrega: 'Entrega',
  visita: 'Visita',
  reunion: 'Reunión',
  postventa: 'Postventa',
  otro: 'Otro',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  taller: 'Taller',
  logistica: 'Logística',
  postventa: 'Postventa',
};

// Tipo Database minimal para Supabase client (no estricto, suficiente para nuestro uso)
export type Database = any; // eslint-disable-line @typescript-eslint/no-explicit-any
