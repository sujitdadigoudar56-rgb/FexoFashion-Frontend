// Cart math ported from cart/models.py's Cart properties. Unused now that
// CartContext trusts the server's own computed totals for the
// authenticated cart (see cart/serializers.py, which mirrors this same
// math server-side) — kept here in case a local/guest cart is ever
// reintroduced, since nothing currently imports this file.

import { gstAmount } from './product';
import type { CartItemState, Coupon, Product } from './types';

const FREE_SHIPPING_THRESHOLD = 2999;
const FLAT_SHIPPING_COST = 149;

export interface ResolvedCartLine {
  item: CartItemState;
  product: Product;
  variantLabel: string | null;
  lineTotal: number;
  lineGst: number;
}

export function resolveCartLines(items: CartItemState[], products: Product[]): ResolvedCartLine[] {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
      const line: ResolvedCartLine = {
        item,
        product,
        variantLabel: variant?.size ?? null,
        lineTotal: product.price * item.quantity,
        lineGst: gstAmount(product, item.quantity),
      };
      return line;
    })
    .filter((line): line is ResolvedCartLine => line !== null);
}

export function cartSubtotal(lines: ResolvedCartLine[]): number {
  return round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
}

export function cartGstTotal(lines: ResolvedCartLine[]): number {
  return round2(lines.reduce((sum, l) => sum + l.lineGst, 0));
}

export function cartShippingCost(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return FLAT_SHIPPING_COST;
}

export function couponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (subtotal < coupon.minimum_order_value) return 0;
  if (coupon.discount_type === 'percent') {
    return round2((subtotal * coupon.discount_value) / 100);
  }
  return Math.min(coupon.discount_value, subtotal);
}

export function cartGrandTotal(subtotal: number, gst: number, shipping: number, discount: number): number {
  const total = subtotal + gst + shipping - discount;
  return total > 0 ? round2(total) : 0;
}

export function itemCount(items: CartItemState[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
