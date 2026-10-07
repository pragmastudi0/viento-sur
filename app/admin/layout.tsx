import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Administrador', robots: { index: false, follow: false }, alternates: { canonical: '/admin' } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
