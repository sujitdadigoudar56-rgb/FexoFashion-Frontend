// Ports templates/website/terms.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 760 }}>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
            By accessing and using FEXO, you agree to these terms. All content, imagery, and designs on
            this site are the property of FEXO and may not be reproduced without permission.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
            Prices are listed in Indian Rupees (INR) and are subject to change without notice. Orders
            are confirmed upon successful placement and are governed by our Shipping and Returns
            policies.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8 }}>
            FEXO reserves the right to refuse service, cancel orders, or restrict access at its
            discretion in cases of suspected fraud or policy violation.
          </p>
        </div>
      </div>
    </>
  );
}
