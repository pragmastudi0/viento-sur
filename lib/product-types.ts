import type { Category } from './category-types';
export interface ProductImage { src: string; alt: string; path?: string }
export interface Variant { id: string; label: string; swatch: string }
export interface Product {
  id: string; slug: string; name: string; categoryId: string; category: Category; categoryLabel: string;
  price: number; images: ProductImage[]; description: string; specifications: string[];
  variants: Variant[]; featured?: boolean; status: 'publicada' | 'oculta';
  createdAt: string; updatedAt: string; sortOrder: number;
}
export const STRUCTURE_VARIANTS: Variant[] = [
  { id: 'negro', label: 'Negro', swatch: '#1C1C1C' },
  { id: 'grafito', label: 'Grafito', swatch: '#4B4B4E' },
  { id: 'bronce', label: 'Bronce', swatch: '#8C6A43' },
];
