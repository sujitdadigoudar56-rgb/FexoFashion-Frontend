'use client';

// Ports templates/accounts/forgot_password.html.
// PHASE 2: POST { email } to Django's password-reset view.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/accounts/password-reset/done');
  };

  return (
    <div className="fx-auth-wrap">
      <h1 className="fx-serif">Forgot Password</h1>
      <p className="fx-sub">Enter your email and we&apos;ll send reset instructions.</p>
      <form onSubmit={handleSubmit}>
        <label className="fx-form-label">Email</label>
        <input type="email" className="fx-input" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-block">Send Reset Link</button>
      </form>
      <p className="fx-auth-switch">
        <Link href="/accounts/login">Back to sign in</Link>
      </p>
    </div>
  );
}
