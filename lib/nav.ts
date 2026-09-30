export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/lamparas-de-pie', label: 'Lámparas de pie' },
  { href: '/veladores', label: 'Veladores' },
  { href: '/personalizados', label: 'Personalizados' },
  { href: '/contacto', label: 'Contacto' },
];
