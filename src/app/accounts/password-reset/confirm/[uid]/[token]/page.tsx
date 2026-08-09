'use client';

// Ports templates/accounts/password_reset_confirm.html. There's no real
// token to validate yet, so the form is always shown as valid.
// PHASE 2: validate uid/token server-side and POST the new password to
// Django's password-reset-confirm view.

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PasswordResetConfirmPage() {
  const router = useRouter();
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/accounts/password-reset/complete');
  };

  return (
    <div className="fx-auth-wrap">
      <h1 className="fx-serif">Set New Password</h1>
      <form onSubmit={handleSubmit}>
        <label className="fx-form-label">New Password</label>
        <input
          type="password"
          className="fx-input"
          required
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
        />
        <label className="fx-form-label">Confirm New Password</label>
        <input
          type="password"
          className="fx-input"
          required
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-block">Reset Password</button>
      </form>
    </div>
  );
}
