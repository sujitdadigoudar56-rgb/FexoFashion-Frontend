// Ports templates/website/privacy_policy.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 760 }}>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
            FEXO respects your privacy. We collect only the information required to process orders,
            manage your account, and improve your shopping experience — including name, contact
            details, shipping address, and order history.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8, marginBottom: 20 }}>
            We never sell your personal data to third parties. Payment details are never stored on our
            servers. You may request access to, correction of, or deletion of your data at any time by
            contacting us.
          </p>
          <p className="fx-muted" style={{ lineHeight: 1.8 }}>
            Cookies are used solely to maintain your cart and session state. Continued use of this site
            indicates acceptance of this policy.
          </p>
        </div>
      </div>
    </>
  );
}
