import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollectionBySlug } from '@/lib/data';
import ShopView, { type ShopSearchParams } from '../../ShopView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return { title: collection?.name ?? 'Collection' };
}

export default async function ShopCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopSearchParams>;
}) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  return <ShopView searchParams={resolvedSearchParams} collectionObj={collection} />;
}
