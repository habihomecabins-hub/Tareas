import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { createOrder } from '@/lib/actions';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/types';
import { generateOrderRef } from '@/lib/utils';

export default async function NuevoPedidoPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name')
    .order('full_name');

  return (
    <div>
      <PageHeader title="Nuevo pedido" back="/pedidos" />

      <form action={createOrder} className="px-5 pt-5 space-y-5 pb-10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Referencia</label>
            <input
              name="reference"
              type="text"
              defaultValue={generateOrderRef()}
              required
              className="input font-mono"
            />
          </div>
          <div>
            <label className="label">Estado</label>
            <select name="status" defaultValue="presupuesto" className="input">
              {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Modelo de casa *</label>
          <input
            name="model"
            type="text"
            required
            className="input"
            placeholder="Ej: Atlas 36, Compact 24…"
          />
        </div>

        <div>
          <label className="label">Cliente</label>
          <select name="client_id" className="input">
            <option value="">Sin cliente asignado</option>
            {(clients ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1.5">
            ¿No está? Créalo en <a href="/clientes" className="underline">Clientes</a> primero.
          </p>
        </div>

        <div>
          <label className="label">Dirección de entrega</label>
          <input
            name="delivery_address"
            type="text"
            className="input"
            placeholder="Calle y número"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ciudad</label>
            <input name="delivery_city" type="text" className="input" placeholder="Vigo" />
          </div>
          <div>
            <label className="label">Fecha entrega</label>
            <input name="delivery_date" type="date" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Precio (€)</label>
          <input
            name="price_eur"
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="label">Notas</label>
          <textarea name="notes" rows={3} className="input resize-none" />
        </div>

        <div className="pt-3">
          <button type="submit" className="btn-primary w-full">
            Crear pedido
          </button>
        </div>
      </form>
    </div>
  );
}
