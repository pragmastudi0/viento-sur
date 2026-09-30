/**
 * Formato de moneda argentino.
 *   78000  →  "$78.000"
 * Usa Intl.NumberFormat para un resultado consistente en servidor y cliente.
 */
const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  // Intl agrega un espacio duro ("$ 78.000") en algunos entornos; lo quitamos
  // para respetar el estilo de la marca ("$78.000").
  return formatter.format(value).replace(/\s/g, '');
}
