import { redirect } from 'next/navigation';
import { LogOut, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/PageHeader';
import { signOut } from '@/lib/actions';
import { ROLE_LABEL } from '@/lib/types';
import { initials } from '@/lib/utils';

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <PageHeader title="Mi perfil" />

      <div className="px-5 pt-5 space-y-5">
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ink text-bg font-display text-2xl font-semibold mb-3">
            {initials(profile?.full_name)}
          </div>
          <div className="font-display text-xl font-medium">{profile?.full_name}</div>
          <div className="text-sm text-muted mt-0.5">{user.email}</div>
          {profile?.role && (
            <div className="badge bg-surface-2 text-ink mt-3 inline-flex">
              {ROLE_LABEL[profile.role as keyof typeof ROLE_LABEL]}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium mb-1">Instalar como app móvil</div>
              <p className="text-muted leading-relaxed">
                <strong>iPhone (Safari):</strong> Pulsa <em>Compartir</em> → <em>Añadir a pantalla de inicio</em>.
                <br />
                <strong>Android (Chrome):</strong> Menú ⋮ → <em>Añadir a pantalla de inicio</em>.
              </p>
            </div>
          </div>
        </div>

        <form action={signOut}>
          <button type="submit" className="btn-secondary w-full text-danger">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </form>

        <p className="text-center text-xs text-muted pt-2">
          Casas Expansibles · v1.0
        </p>
      </div>
    </div>
  );
}
