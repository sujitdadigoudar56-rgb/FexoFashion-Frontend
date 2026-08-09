// Ports templates/website/faq.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import { getFAQs } from '@/lib/data';

export const metadata: Metadata = { title: 'FAQ' };

export default async function FaqPage() {
  const faqs = await getFAQs();

  return (
    <>
      <PageHeader eyebrow="Help" title="Frequently Asked Questions" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 760 }}>
          {faqs.length === 0 && (
            <p className="fx-muted">FAQs will appear here once added in the admin dashboard.</p>
          )}
          {faqs.map((faq) => (
            <details key={faq.id} style={{ borderBottom: '1px solid var(--fx-line-soft)', padding: '20px 0' }}>
              <summary style={{ cursor: 'pointer', fontSize: 16 }}>{faq.question}</summary>
              <p className="fx-muted" style={{ marginTop: 14, lineHeight: 1.7 }}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
