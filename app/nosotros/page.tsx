import type { Metadata } from 'next';
import BrandStorySection from '@/components/BrandStorySection';

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Viento Sur diseña y fabrica lámparas en Córdoba Capital. Conocé nuestras piezas impresas en 3D y el cuidado por sus formas, materiales y texturas.',
  alternates: { canonical: '/nosotros' },
};

export default function NosotrosPage() {
  return <BrandStorySection />;
}
