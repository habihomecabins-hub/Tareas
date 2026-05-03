import Link from 'next/link';
import { Plus, MapPin, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { OrderStatusBadge } from '@/components/Badges';
import { smartDate } from '@/lib/utils';

export default async function PedidosPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, client:clients(id, full_name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={`${orders?.length ?? 0} ${(orders?.length ?? 0) === 1 ? 'pedido' : 'pedidos'}`}
        action={
          <Link href="/pedidos/nuevo" className="btn-primary !py-2 !px-3">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </Link>
        }
      />

      <div className="px-5 pt-5 space-y-2.5">
        {!orders || orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted text-sm mb-4">Aún no hay pedidos registrados</p>
            <Link href="/pedidos/nuevo" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Crear primer pedido
            </Link>
          </div>
        ) : (
          orders.map((o: any) => (
            <Link
              key={o.id}
              href={`/pedidos/${o.id}`}
              className="block card p-4 hover:shadow-lift transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-muted">{o.reference}</div>
                  <div className="font-medium text-ink mt-0.5">{o.model}</div>
                  {o.client && (
                    <div className="text-sm text-muted mt-0.5">{o.client.full_name}</div>
                  )}
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted mt-2">
                {o.delivery_city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {o.delivery_city}
                  </span>
                )}
                {o.delivery_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {smartDate(o.delivery_date)}
                  </span>
                )}
                {o.price_eur && (
                  <span className="ml-auto font-medium text-ink">
                    {Number(o.price_eur).toLocaleString('es-ES')} €
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
