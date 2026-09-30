/**
 * ─────────────────────────────────────────────────────────────
 *  CATÁLOGO — fuente única de datos
 * ─────────────────────────────────────────────────────────────
 * Para agregar / editar productos, precios o imágenes, modificá SOLO este
 * archivo. Ningún componente escribe datos de producto por su cuenta.
 *
 * Imágenes: colocá los archivos en /public/products/ y referencialos con la
 * ruta "/products/nombre.jpg". Podés listar varias imágenes por producto.
 */

export type CategorySlug = 'lampara-de-pie' | 'velador';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Variant {
  id: string;
  label: string;
  /** Color de muestra (swatch) para el selector. */
  swatch: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  price: number;
  images: ProductImage[];
  description: string;
  specifications: string[];
  variants: Variant[];
  featured?: boolean;
}

/** Terminaciones de estructura, compartidas por todos los modelos. */
export const STRUCTURE_VARIANTS: Variant[] = [
  { id: 'negro', label: 'Negro', swatch: '#1C1C1C' },
  { id: 'grafito', label: 'Grafito', swatch: '#4B4B4E' },
  { id: 'bronce', label: 'Bronce', swatch: '#8C6A43' },
];

export const CATEGORIES: { slug: CategorySlug; label: string; plural: string }[] = [
  { slug: 'lampara-de-pie', label: 'Lámpara de pie', plural: 'Lámparas de pie' },
  { slug: 'velador', label: 'Velador', plural: 'Veladores' },
];

export const products: Product[] = [
  {
    id: 'lanin',
    slug: 'lanin',
    name: 'Lanin',
    category: 'lampara-de-pie',
    categoryLabel: 'Lámpara de pie',
    price: 78000,
    images: [
      { src: '/products/lanin-1.jpg', alt: 'Lámpara de pie Lanin de brazo curvo junto a un sillón de madera' },
      { src: '/products/lanin-2.jpg', alt: 'Detalle de la pantalla cónica de la lámpara Lanin con luz cálida' },
    ],
    description:
      'Una lámpara de pie de brazo curvo que se inclina sobre el ambiente. Su base de hierro redonda y su pantalla impresa en PLA difunden una luz blanca cálida, ideal para acompañar un sillón o un rincón de lectura.',
    specifications: [
      'Base de hierro redonda',
      'Pantalla plástica PLA',
      'Luz blanca cálida',
      'Altura 1,7 m',
    ],
    variants: STRUCTURE_VARIANTS,
    featured: true,
  },
  {
    id: 'lanin-xl',
    slug: 'lanin-xl',
    name: 'Lanin XL',
    category: 'lampara-de-pie',
    categoryLabel: 'Lámpara de pie',
    price: 105000,
    images: [
      { src: '/products/lanin-xl-1.jpg', alt: 'Lámpara de pie Lanin XL con pantalla amplia sobre un sillón' },
    ],
    description:
      'La versión de mayor presencia de nuestra Lanin. Su pantalla más amplia envuelve la luz y la reparte con suavidad sobre el espacio.',
    specifications: [
      'Pantalla de 27 cm de ancho',
      'Pantalla de 27 cm de alto',
    ],
    variants: STRUCTURE_VARIANTS,
    featured: true,
  },
  {
    id: 'traful',
    slug: 'traful',
    name: 'Traful',
    category: 'lampara-de-pie',
    categoryLabel: 'Lámpara de pie',
    price: 72000,
    images: [
      { src: '/products/traful-1.jpg', alt: 'Lámpara de pie Traful de línea estilizada junto a una silla y una planta' },
      { src: '/products/traful-2.jpg', alt: 'Detalle de la pantalla acanalada de la lámpara Traful' },
    ],
    description:
      'Línea estilizada y pantalla acanalada que filtra la luz en un resplandor cálido. Su base de hierro rectangular le da estabilidad y un perfil sereno.',
    specifications: [
      'Base de hierro rectangular',
      'Pantalla plástica PLA',
      'Luz blanca cálida',
      'Altura 1,8 m',
    ],
    variants: STRUCTURE_VARIANTS,
    featured: true,
  },
  {
    id: 'piedra-mora',
    slug: 'piedra-mora',
    name: 'Piedra Mora',
    category: 'lampara-de-pie',
    categoryLabel: 'Lámpara de pie',
    price: 72000,
    images: [
      { src: '/products/piedra-mora-1.jpg', alt: 'Lámpara de pie Piedra Mora en un rincón junto a una planta' },
      { src: '/products/piedra-mora-2.jpg', alt: 'Detalle de la pantalla de la lámpara Piedra Mora con luz cálida' },
    ],
    description:
      'Una silueta esbelta que se abre en la pantalla como una flor. La textura del PLA deja pasar una luz suave y envolvente.',
    specifications: [
      'Base de hierro redonda',
      'Pantalla plástica PLA',
      'Luz blanca cálida',
      'Altura 1,75 m',
    ],
    variants: STRUCTURE_VARIANTS,
  },
  {
    id: 'manly',
    slug: 'manly',
    name: 'Manly',
    category: 'velador',
    categoryLabel: 'Velador',
    price: 35000,
    images: [
      { src: '/products/manly-1.jpg', alt: 'Velador Manly con pantalla texturada encendido sobre una mesa' },
    ],
    description:
      'Un velador de mesa con pantalla texturada que dibuja ondas de luz sobre la pared. Compacto y cálido para una mesa de luz o un escritorio.',
    specifications: [
      'Base de hierro redonda',
      'Pantalla plástica PLA',
      'Luz blanca cálida',
      'Altura 22 cm',
    ],
    variants: STRUCTURE_VARIANTS,
    featured: true,
  },
  {
    id: 'kids',
    slug: 'kids',
    name: 'Kids',
    category: 'velador',
    categoryLabel: 'Velador',
    price: 35000,
    images: [
      { src: '/products/kids-1.jpg', alt: 'Velador Kids con estrellas y lunas caladas encendido sobre una mesa' },
    ],
    description:
      'Un velador pensado para las infancias, con estrellas y lunas caladas que proyectan una luz tenue y tranquila a la hora de dormir.',
    specifications: [
      'Base de hierro redonda',
      'Pantalla plástica PLA',
      'Luz blanca cálida',
      'Altura 17 cm',
    ],
    variants: STRUCTURE_VARIANTS,
  },
];

/* ── Helpers ──────────────────────────────────────────────── */

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getAllSlugs(): string[] {
  return products.map((p) => p.slug);
}
