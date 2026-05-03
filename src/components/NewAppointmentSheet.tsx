'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createAppointment } from '@/lib/actions';
import { APPOINTMENT_KIND_LABEL, type AppointmentKind } from '@/lib/types';

interface OrderOption {
  id: string;
  reference: string;
  model: string;
}

export function NewAppointmentSheet({ orders }: { orders: OrderOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createAppointment(formData);
        setOpen(false);
      } catch (e: any) {
        alert(e.message);
      }
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary !py-2 !px-3">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nueva</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-w-2xl mx-auto bg-bg rounded-t-3xl shadow-lift animate-slide-up max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium">Nueva cita</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost !p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="px-5 py-5 space-y-4 pb-10">
              <div>
                <label className="label">Título *</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="input"
                  placeholder="Visita técnica casa de María"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Tipo</label>
                <select name="kind" defaultValue="otro" className="input">
                  {(Object.keys(APPOINTMENT_KIND_LABEL) as AppointmentKind[]).map((k) => (
                    <option key={k} value={k}>{APPOINTMENT_KIND_LABEL[k]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Inicio *</label>
                  <input name="starts_at" type="datetime-local" required className="input" />
                </div>
                <div>
                  <label className="label">Fin *</label>
                  <input name="ends_at" type="datetime-local" required className="input" />
                </div>
              </div>

              <div>
                <label className="label">Ubicación</label>
                <input name="location" type="text" className="input" placeholder="Dirección, finca, oficina…" />
              </div>

              <div>
                <label className="label">Pedido relacionado</label>
                <select name="order_id" className="input">
                  <option value="">Ninguno</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.reference} · {o.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Notas</label>
                <textarea name="notes" rows={2} className="input resize-none" />
              </div>

              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={pending} className="btn-primary flex-1">
                  {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
