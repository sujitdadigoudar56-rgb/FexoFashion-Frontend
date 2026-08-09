// Ports templates/website/contact.html.

import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import ContactForm from './ContactForm';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Get in Touch" title="Contact Us" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 600 }}>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
