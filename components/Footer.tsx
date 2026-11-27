import type { NavLink } from '@/lib/nav';
import Link from 'next/link';
import Logo from './Logo';
import { SITE, WHATSAPP_DISPLAY } from '@/lib/site';
import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import { InstagramIcon, WhatsAppIcon } from './icons';
import { CARE_PAGE, LEGAL_LINKS } from '@/lib/legal';
import CookieSettingsButton from './consent/CookieSettingsButton';

/** Páginas institucionales; el resto de los enlaces de navegación (salvo Inicio) forman la colección. */
const BRAND_HREFS = ['/nosotros', '/personalizados', '/contacto'];

const heading = 'font-sans text-[0.68rem] font-semibold uppercase tracking-label text-cream/60';
const linkClass = 'text-cream/80 transition-colors hover:text-cream';

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className={heading}>{title}</h2>
      <ul className="mt-3.5 space-y-2 text-sm">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={`break-words ${linkClass}`}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer({ links }: { links: NavLink[] }) {
  const collection = links.filter(link => link.href !== '/' && !BRAND_HREFS.includes(link.href));
  const brand = [...BRAND_HREFS.flatMap(href => links.filter(link => link.href === href)), CARE_PAGE];
  const developer = SITE.developer;

  return (
    <footer className="bg-ink-deep text-cream">
      <div className="container-page pb-5 pt-9 sm:pt-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:gap-x-10 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr] lg:gap-x-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label={`${SITE.name}, inicio`} className="inline-block">
              <Logo tone="cream" size={32} />
            </Link>
            <p className="mt-4 font-display text-lg font-light italic leading-snug text-cream/90">
              Iluminación que transforma espacios.
            </p>
            <p className="mt-1.5 text-sm text-cream/65">Diseñado y fabricado en Córdoba, Argentina.</p>
          </div>

          <LinkColumn title="Colección" links={collection} />
          <LinkColumn title={SITE.name} links={brand} />

          <div data-analytics-location="footer" className="col-span-2 md:col-span-1">
            <h2 className={heading}>Contacto</h2>
            <ul className="mt-3.5 space-y-2 text-sm">
              <li>
                <a
                  href={waLink(generalInquiryMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2.5 ${linkClass}`}
                >
                  <WhatsAppIcon size={16} className="shrink-0" />
                  <span><span className="sr-only">WhatsApp </span>{WHATSAPP_DISPLAY}</span>
                </a>
              </li>
              {SITE.instagram && (
                <li>
                  <a
                    href={SITE.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2.5 break-all ${linkClass}`}
                  >
                    <InstagramIcon size={16} className="shrink-0" />
                    <span><span className="sr-only">Instagram </span>{SITE.instagramHandle}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-3 border-t border-cream/15 pt-4 text-xs text-cream/65 sm:mt-9 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
          <nav aria-label="Información legal">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-cream">{link.label}</Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className="transition-colors hover:text-cream" />
              </li>
            </ul>
          </nav>
          <p className="lg:text-right">
            Desarrollado por{' '}
            {developer.url ? (
              <a href={developer.url} target="_blank" rel="noopener noreferrer" className="font-medium text-cream/85 transition-colors hover:text-cream">
                {developer.name}
              </a>
            ) : (
              <span className="font-medium text-cream/85">{developer.name}</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
