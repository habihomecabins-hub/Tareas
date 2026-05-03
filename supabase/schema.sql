-- =====================================================================
-- CASAS EXPANSIBLES — Esquema completo de base de datos
-- Pega este SQL en: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- =====================================================================
-- TABLA: profiles
-- Extiende auth.users con datos de perfil y rol
-- =====================================================================
create type user_role as enum ('admin', 'taller', 'logistica', 'postventa');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'taller',
  phone text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Trigger: crear perfil automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'taller')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- TABLA: clients (clientes finales)
-- =====================================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text,
  phone text,
  address text,
  city text,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create index idx_clients_name on public.clients (lower(full_name));

-- =====================================================================
-- TABLA: orders (pedidos / casas)
-- =====================================================================
create type order_status as enum (
  'presupuesto', 'confirmado', 'en_produccion',
  'listo_entrega', 'entregado', 'postventa', 'cerrado'
);

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,        -- ej: CE-2026-001
  client_id uuid references public.clients(id) on delete restrict,
  model text not null,                    -- modelo de casa
  delivery_address text,
  delivery_city text,
  delivery_date date,
  status order_status not null default 'presupuesto',
  price_eur numeric(10, 2),
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create index idx_orders_status on public.orders (status);
create index idx_orders_delivery on public.orders (delivery_date);
create index idx_orders_client on public.orders (client_id);

-- =====================================================================
-- TABLA: tasks (tareas de trabajadores)
-- =====================================================================
create type task_area as enum ('taller', 'entrega', 'postventa', 'oficina');
create type task_status as enum ('pendiente', 'en_curso', 'bloqueada', 'hecha');
create type task_priority as enum ('baja', 'normal', 'alta', 'urgente');

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  area task_area not null default 'taller',
  status task_status not null default 'pendiente',
  priority task_priority not null default 'normal',
  assignee_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create index idx_tasks_assignee on public.tasks (assignee_id);
create index idx_tasks_status on public.tasks (status);
create index idx_tasks_area on public.tasks (area);
create index idx_tasks_due on public.tasks (due_date);
create index idx_tasks_order on public.tasks (order_id);

-- Trigger: marcar completed_at cuando una tarea pasa a 'hecha'
create or replace function public.handle_task_completed()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'hecha' and (old.status is null or old.status <> 'hecha') then
    new.completed_at := now();
  elsif new.status <> 'hecha' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger trg_task_completed
  before update on public.tasks
  for each row execute function public.handle_task_completed();

-- =====================================================================
-- TABLA: comments (comentarios en tareas — chat ligero)
-- =====================================================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_comments_task on public.comments (task_id, created_at);

-- =====================================================================
-- TABLA: appointments (citas del calendario)
-- =====================================================================
create type appointment_kind as enum ('entrega', 'visita', 'reunion', 'postventa', 'otro');

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  kind appointment_kind not null default 'otro',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  order_id uuid references public.orders(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  attendees uuid[] default '{}',
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  check (ends_at >= starts_at)
);

create index idx_appointments_starts on public.appointments (starts_at);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) — políticas de seguridad
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.orders enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.appointments enable row level security;

-- Función helper: comprobar si el usuario es admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES: todos pueden leer perfiles activos, solo el dueño o admin puede actualizar
create policy "profiles_read_all" on public.profiles
  for select using (active = true or auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.is_admin());

-- CLIENTS, ORDERS, TASKS, COMMENTS, APPOINTMENTS:
-- todos los usuarios autenticados pueden leer y escribir (equipo pequeño <5 personas)
-- Si más adelante quieres restringir, puedes refinar las políticas

create policy "clients_authenticated" on public.clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "orders_authenticated" on public.orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "tasks_authenticated" on public.tasks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "comments_authenticated" on public.comments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "appointments_authenticated" on public.appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================================
-- REALTIME — habilitar para tareas y comentarios
-- =====================================================================
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.appointments;

-- =====================================================================
-- DATOS DE EJEMPLO (opcional — puedes borrarlo o ejecutarlo aparte)
-- =====================================================================
-- Descomentar para insertar algunos datos de prueba:
/*
insert into public.clients (full_name, email, phone, city) values
  ('María García López', 'maria@email.com', '+34 600 111 222', 'Vigo'),
  ('Juan Pérez Rodríguez', 'juan@email.com', '+34 600 333 444', 'Pontevedra'),
  ('Carmen Fernández', 'carmen@email.com', '+34 600 555 666', 'Santiago');
*/
