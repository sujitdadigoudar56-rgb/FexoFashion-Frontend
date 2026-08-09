// Ports templates/website/journal.html.

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { getBlogPosts } from '@/lib/data';

export const metadata: Metadata = { title: 'Journal' };

export default async function JournalPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHeader eyebrow="Editorial" title="The Journal" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container">
          <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            {posts.length === 0 && (
              <p className="fx-muted">Journal entries will appear here once published in the admin dashboard.</p>
            )}
            {posts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="fx-card">
                <div className="fx-card-media">
                  <img
                    className="fx-img-primary"
                    src={post.cover_image ?? 'https://placehold.co/600x800/121212/8a8a8a?text=FEXO+Journal'}
                    alt={post.title}
                  />
                </div>
                <div className="fx-card-info" style={{ display: 'block' }}>
                  <h3 className="fx-serif" style={{ fontSize: 20, marginBottom: 8 }}>{post.title}</h3>
                  <p className="fx-muted" style={{ fontSize: 13 }}>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
