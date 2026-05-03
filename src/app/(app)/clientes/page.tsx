import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { createClient as createSupabase } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { NewClientSheet } from '@/components/NewClientSheet';

export default async function ClientesPage() {
  const supabase = await createSupabase();
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('full_name');

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clients?.length ?? 0} ${(clients?.length ?? 0) === 1 ? 'cliente' : 'clientes'}`}
        action={<NewClientSheet />}
      />

      <div className="px-5 pt-5 space-y-2">
        {!clients || clients.length === 0 ? (
          <div className="card p-8 text-center text-muted text-sm">
            Aún no hay clientes registrados
          </div>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="font-medium">{c.full_name}</div>
              {c.city && <div className="text-sm text-muted">{c.city}</div>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-ink hover:underline">
                    <Phone className="w-3.5 h-3.5" /> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-ink hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </a>
                )}
                {c.address && (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <MapPin className="w-3.5 h-3.5" /> {c.address}
                  </span>
                )}
              </div>
              {c.notes && (
                <p className="text-sm text-muted mt-2 pt-2 border-t border-border">{c.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
