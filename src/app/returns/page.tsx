// Ports templates/website/returns.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Returns' };

export default function ReturnsPage() {
  return (
    <>
      <PageHeader eyebrow="Support" title="Returns & Exchanges" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 760 }}>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
            We accept returns within 14 days of delivery for unworn items with original tags attached.
            Initiate a return from your Orders dashboard or by contacting our support team.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8 }}>
            Refunds are issued to the original payment method within 5–7 business days of receiving the
            returned item. Sale items are final and not eligible for return.
          </p>
        </div>
      </div>
    </>
  );
}
