// Types mirror the Django model fields 1:1 (snake_case) on purpose — see
// Fexo_backend's products/categories/accounts/cart/orders/wishlist/website
// apps. When Phase 2 wires this app to a real DRF API, the JSON shape
// coming back should need little to no translation against these types.

export type ProductStatus = 'draft' | 'published' | 'archived';
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parent: number | null;
  is_active: boolean;
  display_order: number;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  banner_image: string | null;
  is_limited_drop: boolean;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: number;
  product: number;
  size: Size;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface ProductReview {
  id: number;
  product: number;
  user: Pick<User, 'id' | 'username' | 'first_name'>;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: Category;
  collections: Collection[];
  short_description: string;
  description: string;
  fabric_details: string;
  size_guide: string;
  price: number;
  compare_at_price: number | null;
  gst_percent: number;
  color: string;
  available_sizes: string; // comma separated, e.g. "S,M,L,XL"
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  status: ProductStatus;
  created_at: string;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
}

export interface Address {
  id: number;
  address_type: 'billing' | 'shipping';
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Coupon {
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  minimum_order_value: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product_slug: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  size: string;
}

export interface Order {
  order_number: string;
  billing_address: Address | null;
  shipping_address: Address | null;
  subtotal: number;
  gst_amount: number;
  shipping_cost: number;
  discount_amount: number;
  grand_total: number;
  coupon_code: string | null;
  payment_method: 'cod';
  status: OrderStatus;
  notes: string;
  created_at: string;
  items: OrderItem[];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author_name: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_title: string;
  quote: string;
  rating: number;
}

export interface InstagramPost {
  id: number;
  image: string;
  link_url: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  link_url: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

// ---- cart (GET /api/cart/, mirrors cart/serializers.py) ----

export interface CartLineProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  primary_image: string | null;
}

export interface CartLine {
  id: number;
  product: CartLineProduct;
  variant: number | null;
  variant_size: string | null;
  quantity: number;
  line_total: number;
  gst_amount: number;
}

export interface CartState {
  id: number;
  items: CartLine[];
  subtotal: number;
  gst_total: number;
  shipping_cost: number;
  discount_amount: number;
  grand_total: number;
  coupon_code: string | null;
}

// ---- unused now that Cart/Wishlist are server-backed (kept only so
// lib/pricing.ts — dead code for now, see its header comment — still
// compiles; harmless to leave in case a local/guest cart is revisited) ----

export interface CartItemState {
  productId: number;
  variantId: number | null;
  quantity: number;
}

export interface WishlistItemState {
  productId: number;
}
