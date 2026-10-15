'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import CartButton from './CartButton';
import MobileMenu from './MobileMenu';
import type { NavItem } from '@/lib/nav';

export default function Header({ links }: { links: NavItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-cream/85 backdrop-blur-md transition-all duration-300 ease-soft ${
          scrolled ? 'border-b border-ink/10 py-2.5' : 'border-b border-transparent py-4'
        }`}
      >
      <div className="container-page flex items-center justify-between gap-4">
        <Link href="/" aria-label="Viento Sur — Inicio" className="shrink-0">
          <Logo size={scrolled ? 30 : 34} />
        </Link>

        <nav aria-label="Principal" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {links.map((link) => {
              const hasChildren = !!link.children?.length;
              return (
                <li key={link.href} className={`min-w-0 max-w-full ${hasChildren ? 'group relative' : ''}`}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    aria-haspopup={hasChildren || undefined}
                    className={`relative inline-flex items-center gap-1 break-words py-1 transition-colors hover:text-ink ${
                      isActive(link.href) ? 'text-ink' : 'text-ink/60'
                    }`}
                  >
                    {link.label}
                    {hasChildren && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 transition-transform duration-200 group-hover:rotate-180">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isActive(link.href) && (
                      <span className="absolute -bottom-0.5 left-0 h-px w-full bg-ink" />
                    )}
                  </Link>

                  {hasChildren && (
                    <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <ul className="min-w-[13rem] rounded-xl border border-ink/10 bg-cream p-1.5 shadow-xl">
                        {link.children!.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={isActive(child.href) ? 'page' : undefined}
                              className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors hover:bg-ink/5 ${
                                isActive(child.href) ? 'text-ink' : 'text-ink/70 hover:text-ink'
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <CartButton />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      </header>

      <MobileMenu links={links} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
