import type { CartItem } from '@/context/CartContext';
import type { Product } from './product-types';
export function reconcileCart(items: CartItem[], products: Product[]) {
  let changed = false;
  const next: CartItem[] = [];
  for (const item of items) {
    const p = products.find(p => p.id === item.productId);
    const variant = p?.variants.find(v => v.id === item.variantId);
    if (!p || !variant) { changed = true; continue; }
    const updated = { ...item, name: p.name, price: p.price, slug: p.slug, image: p.images[0].src, variantLabel: variant.label };
    if (JSON.stringify(updated) !== JSON.stringify(item)) changed = true;
    next.push(updated);
  }
  return { items: next, changed };
}
