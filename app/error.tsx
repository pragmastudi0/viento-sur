'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="container-page py-20"><h1 className="text-3xl">No pudimos cargar esta página</h1>
    <p className="my-6 text-ink/65">Revisá tu conexión y volvé a intentar. Tus datos guardados siguen disponibles.</p>
    <button className="btn-primary btn-lg" onClick={reset}>Volver a intentar</button></section>;
}
