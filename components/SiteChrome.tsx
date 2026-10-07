'use client';
import type { Category } from '@/lib/category-types';
import { navigationLinks } from '@/lib/nav';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import FloatingWhatsApp from './FloatingWhatsApp';
export default function SiteChrome({ children, categories, categoryError }: { children: React.ReactNode; categories: Category[]; categoryError: boolean }) {
  const admin = usePathname().startsWith('/admin');
  const links = navigationLinks(categories);
  return <>{!admin && <Header links={links} />}{!admin && categoryError && <p role="alert" className="container-page py-3 text-sm">No pudimos cargar las categorías. <button onClick={() => window.location.reload()} className="underline">Volver a intentar</button></p>}<main id="contenido">{children}</main>{!admin && <><Footer links={links} /><CartDrawer /><FloatingWhatsApp /></>}</>;
}
