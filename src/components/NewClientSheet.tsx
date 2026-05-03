'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createClientRecord } from '@/lib/actions';

export function NewClientSheet() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createClientRecord(formData);
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
        <span className="hidden sm:inline">Nuevo</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-w-2xl mx-auto bg-bg rounded-t-3xl shadow-lift animate-slide-up max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium">Nuevo cliente</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost !p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="px-5 py-5 space-y-4 pb-10">
              <div>
                <label className="label">Nombre completo *</label>
                <input name="full_name" type="text" required className="input" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Teléfono</label>
                  <input name="phone" type="tel" className="input" placeholder="+34 …" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input name="email" type="email" className="input" />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <input name="address" type="text" className="input" />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input name="city" type="text" className="input" />
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
