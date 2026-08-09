// Ports templates/website/about.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Our Story" title="Live in Fashion" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 760 }}>
          <p className="fx-serif" style={{ fontSize: 26, lineHeight: 1.5, marginBottom: 28 }}>
            FEXO was founded on a single conviction: that luxury is not decoration, it is discipline.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 22 }}>
            Every FEXO piece begins in the same place — a question about what a garment should do, not
            just how it should look. We work with a small circle of ateliers, choose fabric before
            silhouette, and release collections in limited runs so that scarcity is never manufactured,
            only honest.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8 }}>
            This is clothing built to be worn for a decade, not a season. Beyond fashion, beyond trend —
            FEXO.
          </p>
        </div>
      </div>
    </>
  );
}
