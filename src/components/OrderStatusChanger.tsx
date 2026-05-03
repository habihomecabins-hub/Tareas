'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateOrderStatus } from '@/lib/actions';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const flow: OrderStatus[] = [
  'presupuesto',
  'confirmado',
  'en_produccion',
  'listo_entrega',
  'entregado',
  'postventa',
  'cerrado',
];

export function OrderStatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(s: OrderStatus) {
    if (s === currentStatus) return;
    startTransition(async () => {
      await updateOrderStatus(orderId, s);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-muted uppercase tracking-wide">Estado del pedido</div>
        {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted" />}
      </div>
      <select
        value={currentStatus}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="input"
      >
        {flow.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1 mt-3">
        {flow.map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= flow.indexOf(currentStatus) ? 'bg-ink' : 'bg-border'
            )}
          />
        ))}
      </div>
    </div>
  );
}
