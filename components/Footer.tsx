import type { NavLink } from '@/lib/nav';
import Link from 'next/link';
import Logo from './Logo';
import { SITE, WHATSAPP_DISPLAY } from '@/lib/site';
import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';
import { LEGAL_LINKS } from '@/lib/legal';
import CookieSettingsButton from './consent/CookieSettingsButton';

export default function Footer({ links }: { links: NavLink[] }) {
  return (
    <footer className="bg-ink-deep text-cream">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tone="cream" size={36} />
            <p className="mt-5 max-w-xs font-display text-lg font-light italic text-cream/80">
              Iluminación que transforma espacios.
            </p>
          </div>

          <nav aria-label="Secciones">
            <p className="label text-cream/45">Colección</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {links.filter(link => link.href !== '/').map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="break-words text-cream/75 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div data-analytics-location="footer">
            <p className="label text-cream/45">Contacto</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={waLink(generalInquiryMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cream/75 transition-colors hover:text-cream"
                >
                  <WhatsAppIcon size={16} />
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </li>
              {SITE.instagram && (
                <li>
                  <a
                    href={SITE.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-cream/75 transition-colors hover:text-cream"
                  >
                    Instagram {SITE.instagramHandle}
                  </a>
                </li>
              )}
              <li className="text-cream/60">Córdoba Capital, Argentina</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-cream/15 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Viento Sur. Lámparas de diseño, Argentina.</p>
          <nav aria-label="Información legal">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-cream">{link.label}</Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className="transition-colors hover:text-cream" />
              </li>
            </ul>
          </nav>
          <p>Desarrollado por <span className="font-medium text-cream/70">Pragma</span></p>
        </div>
      </div>
    </footer>
  );
}
