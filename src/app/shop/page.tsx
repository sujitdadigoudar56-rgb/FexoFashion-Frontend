import type { Metadata } from 'next';
import ShopView, { type ShopSearchParams } from './ShopView';

export const metadata: Metadata = { title: 'Shop' };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const resolved = await searchParams;
  return <ShopView searchParams={resolved} />;
}
