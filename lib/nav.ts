import { categoryHref, type Category } from './category-types';
export interface NavLink { href: string; label: string }
export function navigationLinks(categories: Category[]): NavLink[] {
  return [{ href: '/', label: 'Inicio' }, { href: '/catalogo', label: 'Catálogo' },
    ...categories.map(c => ({ href: categoryHref(c), label: c.name })),
    { href: '/personalizados', label: 'Personalizados' }, { href: '/contacto', label: 'Contacto' }];
}
