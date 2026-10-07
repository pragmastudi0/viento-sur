/** Migration source only. Never imported by public pages. */
import { STRUCTURE_VARIANTS, type Product } from '@/lib/product-types';

export const legacyProducts: Omit<Product, 'status' | 'createdAt' | 'updatedAt' | 'sortOrder'>[] = [
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
