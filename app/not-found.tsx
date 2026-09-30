import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="label">Error 404</p>
      <h1 className="mt-3 font-display text-4xl font-light text-ink sm:text-5xl">
        No encontramos esta página.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65">
        Es posible que el enlace haya cambiado o que la página ya no exista.
        Volvé al inicio o explorá la colección.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary btn-lg">
          Volver al inicio
        </Link>
        <Link href="/catalogo" className="btn-outline btn-lg">
          Ver colección
        </Link>
      </div>
    </section>
  );
}
