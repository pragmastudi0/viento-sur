'use client';
import { clientError } from '@/lib/client-error';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
export default function LoginForm({ recovery = false }: { recovery?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(recovery ? 'password' : 'login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (mode === 'reset') setMessage('Si el correo corresponde a tu cuenta, recibirás un enlace para cambiar la contraseña.');
      else { router.replace('/admin'); router.refresh(); }
    } catch (e) { setMessage(clientError(e)); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
    <Link href="/" className="mb-12"><Logo /></Link>
    <h1 className="text-3xl">{mode === 'login' ? 'Tu catálogo, a mano' : mode === 'reset' ? 'Recuperar acceso' : 'Elegí tu contraseña'}</h1>
    <p className="mt-3 text-ink/65">{mode === 'login' ? 'Ingresá para administrar las lámparas de Viento Sur.' : mode === 'reset' ? 'Te enviaremos un enlace a tu correo.' : 'Usá al menos 12 caracteres para proteger tu cuenta.'}</p>
    <form className="mt-8 space-y-5" onSubmit={submit}><fieldset disabled={!ready || busy} className="space-y-5">
      {mode !== 'password' && <div><label className="field-label" htmlFor="email">Email</label><input id="email" className="field" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></div>}
      {mode !== 'reset' && <div><label className="field-label" htmlFor="password">Contraseña</label><input id="password" className="field" type="password" required minLength={mode === 'password' ? 12 : undefined} maxLength={128} autoComplete={mode === 'password' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></div>}
      {message && <p role="alert" className="rounded-lg bg-sage-tint p-4 text-sm">{message}</p>}
      <button className="btn-primary btn-lg w-full" disabled={busy}>{busy ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : mode === 'reset' ? 'Enviar enlace' : 'Guardar contraseña'}</button>
    </fieldset></form>
    {!recovery && <button className="mt-5 text-sm underline underline-offset-4" onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Olvidé mi contraseña' : 'Volver al inicio de sesión'}</button>}
    <Link href="/" className="mt-10 text-center text-sm text-ink/60">Volver al sitio</Link>
  </div>;
}
