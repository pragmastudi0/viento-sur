import Link from 'next/link';
import type { ReactNode } from 'react';
import { LEGAL, LEGAL_LINKS, LEGAL_PLACEHOLDER } from '@/lib/legal';

/** Valor legal o marcador visible “[A completar por el titular]” si todavía no se cargó. */
export function LegalValue({ value, hint }: { value: string | null; hint?: string }) {
  if (value) return <>{value}</>;
  return (
    <mark className="rounded bg-glow/30 px-1 text-ink" title={hint}>
      {LEGAL_PLACEHOLDER}{hint ? ` (${hint})` : ''}
    </mark>
  );
}

export default function LegalPage({ title, intro, children, current }: {
  title: string; intro: ReactNode; children: ReactNode; current: string;
}) {
  return (
    <article className="container-page py-16 sm:py-20">
      <header className="max-w-3xl">
        <p className="label">Información legal</p>
        <h1 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-ink/55">Última actualización: {LEGAL.updatedAt}</p>
        <div className="mt-5 text-base leading-relaxed text-ink/70">{intro}</div>
      </header>
      <div
        className="mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-ink/70
          [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-ink
          [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-light [&_h2]:text-ink
          [&_h3]:pt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink
          [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5
          [&_strong]:font-semibold [&_strong]:text-ink"
      >
        {children}
      </div>
      <nav aria-label="Otros documentos legales" className="mt-14 max-w-3xl border-t border-ink/10 pt-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LEGAL_LINKS.filter(link => link.href !== current).map(link => (
            <li key={link.href}><Link href={link.href} className="link-quiet">{link.label}</Link></li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
