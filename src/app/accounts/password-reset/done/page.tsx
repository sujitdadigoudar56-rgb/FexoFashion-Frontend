// Ports templates/accounts/password_reset_done.html.

import Link from 'next/link';

export default function PasswordResetDonePage() {
  return (
    <div className="fx-auth-wrap fx-center">
      <h1 className="fx-serif">Check Your Email</h1>
      <p className="fx-sub">If an account exists with that email, reset instructions are on the way.</p>
      <Link href="/accounts/login" className="fx-btn fx-btn-solid">Back to Sign In</Link>
    </div>
  );
}
