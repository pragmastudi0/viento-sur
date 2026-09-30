const ATTRIBUTES = [
  {
    title: 'Diseño',
    text: 'Piezas pensadas para integrarse al ambiente.',
  },
  {
    title: 'Personalización',
    text: 'Estructuras disponibles en diferentes terminaciones.',
  },
  {
    title: 'Luz cálida',
    text: 'Iluminación pensada para generar una atmósfera confortable.',
  },
  {
    title: 'Producción personalizada',
    text: 'Posibilidad de consultar adaptaciones y modelos especiales.',
  },
];

export default function WhyVientoSur() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {ATTRIBUTES.map((attr) => (
          <div key={attr.title} className="border-t border-ink/15 pt-5">
            <h3 className="font-display text-lg font-normal text-ink">
              {attr.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              {attr.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
