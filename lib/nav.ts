import { categoryHref, type Category } from './category-types';
export interface NavLink { href: string; label: string }
// Ítem de navegación que puede tener un submenú (ej: Catálogo despliega las categorías).
export interface NavItem extends NavLink { children?: NavLink[] }

export function navigationLinks(categories: Category[]): NavLink[] {
  return [{ href: '/', label: 'Inicio' }, { href: '/catalogo', label: 'Catálogo' },
    ...categories.map(c => ({ href: categoryHref(c), label: c.name })),
    { href: '/nosotros', label: 'Nosotros' }, { href: '/personalizados', label: 'Personalizados' }, { href: '/contacto', label: 'Contacto' }];
}

// Navegación con las categorías agrupadas como submenú dentro de "Catálogo".
export function navigationTree(categories: Category[]): NavItem[] {
  return [
    { href: '/', label: 'Inicio' },
    {
      href: '/catalogo',
      label: 'Catálogo',
      children: categories.map(c => ({ href: categoryHref(c), label: c.name })),
    },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/personalizados', label: 'Personalizados' },
    { href: '/contacto', label: 'Contacto' },
  ];
}
