'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo('Cuenta creada. Si tienes confirmación por email activada en Supabase, revisa tu correo.');
        setMode('signin');
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-bg to-surface-2">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-ink text-bg mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <path d="M3 11L12 3L21 11V20H15V14H9V20H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">Casas Expansibles</h1>
          <p className="text-muted text-sm mt-1.5">Gestión interna del equipo</p>
        </div>

        <div className="card p-7 animate-slide-up">
          <h2 className="font-display text-xl font-medium mb-1">
            {mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p className="text-muted text-sm mb-6">
            {mode === 'signin'
              ? 'Accede a tu panel de tareas y pedidos'
              : 'Solo el administrador debería crear cuentas'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Pablo Martínez"
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="trabajador@empresa.com"
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded">{error}</div>
            )}
            {info && (
              <div className="text-sm text-success bg-success/10 px-3 py-2 rounded">{info}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setInfo(null);
            }}
            className="text-sm text-muted hover:text-ink mt-5 w-full text-center"
          >
            {mode === 'signin' ? '¿Primera vez? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-8">
          Pulsa <span className="font-medium text-ink">Compartir → Añadir a inicio</span> en tu móvil
          para instalar la app.
        </p>
      </div>
    </main>
  );
}
