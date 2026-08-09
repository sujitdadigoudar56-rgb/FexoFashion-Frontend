// Ports templates/website/shipping.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Shipping' };

export default function ShippingPage() {
  return (
    <>
      <PageHeader eyebrow="Support" title="Shipping Information" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 760 }}>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
            Orders are processed within 1–2 business days. Standard delivery across India takes 3–7
            business days depending on location. Free shipping applies to orders above &#8377;2,999; a
            flat &#8377;149 fee applies below that threshold.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8 }}>
            You&apos;ll receive tracking details by email once your order ships. Currently we ship
            within India only.
          </p>
        </div>
      </div>
    </>
  );
}
