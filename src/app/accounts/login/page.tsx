'use client';

// Ports templates/accounts/login.html — POSTs to /api/accounts/login/.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter a username and password.');
      return;
    }
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Invalid username or password.');
      return;
    }
    pushMessage(`Welcome back, ${username}.`, 'success');
    // Read `next` at submit time (not via useSearchParams()) to avoid
    // needing a Suspense boundary just for this page.
    const next = new URLSearchParams(window.location.search).get('next');
    router.push(next || '/accounts/dashboard');
  };

  return (
    <div className="fx-auth-wrap">
      <h1 className="fx-serif">Sign In</h1>
      <p className="fx-sub">Welcome back to FEXO.</p>
      <form onSubmit={handleSubmit}>
        <label className="fx-form-label">Username</label>
        <input
          type="text"
          className="fx-input"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label className="fx-form-label">Password</label>
        <input
          type="password"
          className="fx-input"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: '#e57373', fontSize: 13, marginBottom: 16 }}>{error}</p>}
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-block" disabled={submitting}>
          {submitting ? 'Signing In…' : 'Sign In'}
        </button>
      </form>
      <p className="fx-auth-switch">
        <Link href="/accounts/password-reset">Forgot password?</Link> &middot; New here?{' '}
        <Link href="/accounts/register">Create an account</Link>
      </p>
    </div>
  );
}
