'use client';
import { useEffect, useRef } from 'react';
export default function ConfirmDelete({ name, busy, cancel, confirm }: { name: string; busy: boolean; cancel: () => void; confirm: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previous?.focus();
  }, []);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/50 p-5"><div ref={ref} role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-xl bg-cream p-6" onKeyDown={e => {
    if (e.key === 'Escape' && !busy) cancel();
    if (e.key === 'Tab') {
      const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
      if (!buttons.length) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons[buttons.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === buttons[buttons.length - 1]) { e.preventDefault(); buttons[0].focus(); }
    }
  }}><h2 id="delete-title" className="text-2xl">¿Eliminar {name}?</h2><p className="mt-4 text-sm leading-relaxed text-ink/65">Desaparecerá del catálogo y de este listado. Si solo querés dejar de ofrecerla por un tiempo, elegí Ocultar.</p><div className="mt-6 flex gap-3"><button disabled={busy} onClick={cancel} className="btn-outline btn-md">Cancelar</button><button disabled={busy} onClick={confirm} className="btn-primary btn-md">{busy ? 'Eliminando…' : 'Eliminar lámpara'}</button></div></div></div>;
}
