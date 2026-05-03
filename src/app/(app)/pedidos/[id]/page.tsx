import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus, Phone, Mail, MapPin, Calendar, Euro, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatusBadge } from '@/components/Badges';
import { OrderStatusChanger } from '@/components/OrderStatusChanger';
import { TaskCard } from '@/components/TaskCard';
import { smartDate, formatDate } from '@/lib/utils';

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, client:clients(*)')
    .eq('id', id)
    .single();

  if (!order) notFound();

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, full_name)
    `)
    .eq('order_id', id)
    .order('status')
    .order('due_date', { nullsFirst: false });

  return (
    <div>
      <PageHeader title={order.reference} subtitle={order.model} back="/pedidos" />

      <div className="px-5 pt-5 space-y-5">
        <OrderStatusChanger orderId={order.id} currentStatus={order.status} />

        {/* Datos del pedido */}
        <div className="card p-5 space-y-3 text-sm">
          {order.client && (
            <Field icon={<User className="w-4 h-4" />} label="Cliente">
              <Link href={`/clientes`} className="hover:underline">
                {order.client.full_name}
              </Link>
              {order.client.phone && (
                <a href={`tel:${order.client.phone}`} className="ml-2 text-ink underline">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  {order.client.phone}
                </a>
              )}
              {order.client.email && (
                <a href={`mailto:${order.client.email}`} className="ml-2 text-ink underline">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email
                </a>
              )}
            </Field>
          )}
          {(order.delivery_address || order.delivery_city) && (
            <Field icon={<MapPin className="w-4 h-4" />} label="Entrega en">
              {[order.delivery_address, order.delivery_city].filter(Boolean).join(', ')}
            </Field>
          )}
          {order.delivery_date && (
            <Field icon={<Calendar className="w-4 h-4" />} label="Fecha entrega">
              {formatDate(order.delivery_date, "EEEE d 'de' MMMM, yyyy")}
              <span className="text-muted ml-2">({smartDate(order.delivery_date)})</span>
            </Field>
          )}
          {order.price_eur && (
            <Field icon={<Euro className="w-4 h-4" />} label="Precio">
              <span className="font-display text-lg font-semibold">
                {Number(order.price_eur).toLocaleString('es-ES')} €
              </span>
            </Field>
          )}
          {order.notes && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted mb-1">Notas</div>
              <p className="text-ink whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Tareas relacionadas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-medium">Tareas del pedido</h2>
            <Link href={`/tareas/nueva?order_id=${order.id}`} className="btn-secondary !py-1.5 !px-2.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Tarea
            </Link>
          </div>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2.5">
              {tasks.map((t: any) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          ) : (
            <div className="card p-5 text-center text-muted text-sm">
              Sin tareas en este pedido
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}
