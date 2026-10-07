export type CategorySlug = 'lampara-de-pie' | 'velador';
export interface ProductImage { src: string; alt: string; path?: string }
export interface Variant { id: string; label: string; swatch: string }
export interface Product {
  id: string; slug: string; name: string; category: CategorySlug; categoryLabel: string;
  price: number; images: ProductImage[]; description: string; specifications: string[];
  variants: Variant[]; featured?: boolean; status: 'publicada' | 'oculta';
  createdAt: string; updatedAt: string; sortOrder: number;
}
export const STRUCTURE_VARIANTS: Variant[] = [
  { id: 'negro', label: 'Negro', swatch: '#1C1C1C' },
  { id: 'grafito', label: 'Grafito', swatch: '#4B4B4E' },
  { id: 'bronce', label: 'Bronce', swatch: '#8C6A43' },
];
export const CATEGORIES: { slug: CategorySlug; label: string; plural: string }[] = [
  { slug: 'lampara-de-pie', label: 'Lámpara de pie', plural: 'Lámparas de pie' },
  { slug: 'velador', label: 'Velador', plural: 'Veladores' },
];
