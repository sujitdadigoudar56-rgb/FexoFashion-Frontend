// Ports templates/accounts/password_reset_complete.html.

import Link from 'next/link';

export default function PasswordResetCompletePage() {
  return (
    <div className="fx-auth-wrap fx-center">
      <h1 className="fx-serif">Password Updated</h1>
      <p className="fx-sub">You can now sign in with your new password.</p>
      <Link href="/accounts/login" className="fx-btn fx-btn-solid">Sign In</Link>
    </div>
  );
}
