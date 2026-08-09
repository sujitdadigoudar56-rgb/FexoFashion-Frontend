// Ports templates/website/journal_detail.html.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return { title: post ? `${post.title} — Journal` : 'Journal' };
}

export default async function JournalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div style={{ paddingTop: 150 }}>
      <div className="fx-container" style={{ maxWidth: 760 }}>
        <span className="fx-eyebrow">
          {post.author_name} &middot;{' '}
          {new Date(post.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <h1 className="fx-serif" style={{ fontSize: 44, margin: '16px 0 30px' }}>{post.title}</h1>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', marginBottom: 36 }} />
        )}
        <div className="fx-muted" style={{ lineHeight: 1.9, fontSize: 16, whiteSpace: 'pre-line' }}>
          {post.content}
        </div>
      </div>
    </div>
  );
}
