'use client';

import { useState, useTransition, useEffect } from 'react';
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(31, 42, 36, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '32rem',
              maxHeight: 'calc(100vh - 2rem)',
              backgroundColor: 'rgb(247, 245, 240)',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflowY: 'auto',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-display text-lg font-medium">Nueva cita</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost !p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="px-5 py-5 space-y-4 pb-6">
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
