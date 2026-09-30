import Link from 'next/link';
import Logo from './Logo';
import { SITE, WHATSAPP_DISPLAY } from '@/lib/site';
import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

const FOOTER_LINKS = [
  { href: '/lamparas-de-pie', label: 'Lámparas de pie' },
  { href: '/veladores', label: 'Veladores' },
  { href: '/personalizados', label: 'Personalizados' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Footer() {
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
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/75 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
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
                    className="text-cream/75 transition-colors hover:text-cream"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 text-xs text-cream/45">
          <p>© {new Date().getFullYear()} Viento Sur. Lámparas de diseño, Argentina.</p>
        </div>
      </div>
    </footer>
  );
}
