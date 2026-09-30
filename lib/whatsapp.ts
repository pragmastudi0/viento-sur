import { WHATSAPP_NUMBER } from './site';
import { formatPrice } from './currency';

export interface WhatsAppOrderItem {
  name: string;
  variantLabel: string;
  quantity: number;
  price: number; // precio unitario
}

export interface WhatsAppCustomer {
  name: string;
  address?: string;
  province?: string;
  phone?: string;
  comments?: string;
}

/** Arma el enlace wa.me con el mensaje ya codificado. */
export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Consulta general por modelos personalizados. */
export function customInquiryMessage(): string {
  return 'Hola Viento Sur, quería consultar por una lámpara personalizada.';
}

/** Consulta por un modelo puntual (botón "Consultar por este modelo"). */
export function productInquiryMessage(productName: string): string {
  return `Hola Viento Sur, quería consultar por el modelo ${productName}.`;
}

/** Consulta general (hero / contacto). */
export function generalInquiryMessage(): string {
  return 'Hola Viento Sur, quería hacer una consulta.';
}

/**
 * Mensaje de pedido completo, generado dinámicamente desde el carrito.
 * Respeta el formato definido por la marca.
 */
export function orderMessage(
  items: WhatsAppOrderItem[],
  customer: WhatsAppCustomer,
): string {
  const lines: string[] = [];

  lines.push('Hola Viento Sur');
  lines.push('');
  lines.push('Quiero hacer el siguiente pedido:');
  lines.push('');

  for (const item of items) {
    lines.push(`• ${item.quantity} × ${item.name}`);
    lines.push(`Estructura: ${item.variantLabel}`);
    lines.push(formatPrice(item.price * item.quantity));
    lines.push('');
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  lines.push(`TOTAL: ${formatPrice(total)}`);
  lines.push('');

  lines.push(`Nombre: ${customer.name}`);
  if (customer.address && customer.address.trim()) {
    lines.push(`Dirección: ${customer.address.trim()}`);
  }
  if (customer.province && customer.province.trim()) {
    lines.push(`Provincia: ${customer.province.trim()}`);
  }
  if (customer.phone && customer.phone.trim()) {
    lines.push(`Teléfono: ${customer.phone.trim()}`);
  }

  if (customer.comments && customer.comments.trim()) {
    lines.push('');
    lines.push('Comentarios:');
    lines.push(customer.comments.trim());
  }

  lines.push('');
  lines.push('¿Me confirman disponibilidad, tiempo de entrega y formas de pago?');

  return lines.join('\n');
}
