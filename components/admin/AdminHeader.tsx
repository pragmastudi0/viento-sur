'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
export default function AdminHeader() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/auth', { method: 'DELETE' });
      if (!response.ok) throw new Error();
      router.replace('/admin/login'); router.refresh();
    } catch { setError('No pudimos cerrar sesión. Intentá nuevamente.'); setBusy(false); }
  }
  return <header className="border-b border-ink/10"><div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
    <Link href="/admin" aria-label="Administrador Viento Sur"><Logo /></Link>
    <nav className="flex items-center gap-4 text-sm"><Link href="/catalogo" target="_blank">Ver catálogo</Link>
      <button disabled={busy} onClick={logout} className="btn-outline btn-md">{busy ? 'Cerrando…' : 'Cerrar sesión'}</button></nav>
    {error && <p role="alert" className="w-full text-sm">{error}</p>}
  </div></header>;
}
