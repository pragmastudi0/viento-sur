'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { NAV_LINKS } from '@/lib/nav';
import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import Logo from './Logo';
import { WhatsAppIcon } from './icons';

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-300 ease-soft ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <Logo size={30} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label="Principal (móvil)" className="flex-1 px-6 py-6">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`block py-3 font-display text-2xl transition-colors ${
                      active ? 'text-ink' : 'text-ink/70 hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink/10 p-6">
          <a
            href={waLink(generalInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="btn-whatsapp btn-md w-full"
          >
            <WhatsAppIcon />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
