'use client';

// Ports the contact form from templates/website/contact.html.
// PHASE 2: POST { name, email, subject, message } to /contact/.

import { useState } from 'react';
import { useMessages } from '@/context/MessageContext';

export default function ContactForm() {
  const { pushMessage } = useMessages();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushMessage('Thanks for reaching out — we will get back to you shortly.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="fx-form-label">Name</label>
      <input
        type="text"
        className="fx-input"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <label className="fx-form-label">Email</label>
      <input
        type="email"
        className="fx-input"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <label className="fx-form-label">Subject</label>
      <input
        type="text"
        className="fx-input"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      />
      <label className="fx-form-label">Message</label>
      <textarea
        className="fx-textarea"
        rows={5}
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button type="submit" className="fx-btn fx-btn-solid">Send Message</button>
    </form>
  );
}
