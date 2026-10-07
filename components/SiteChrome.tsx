'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import FloatingWhatsApp from './FloatingWhatsApp';
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const admin = usePathname().startsWith('/admin');
  return <>{!admin && <Header />}<main id="contenido">{children}</main>{!admin && <><Footer /><CartDrawer /><FloatingWhatsApp /></>}</>;
}
