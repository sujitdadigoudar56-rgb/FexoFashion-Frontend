'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function LoginForm() {
  const { login } = useAuth();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Enter your email or mobile number and your password.');
      return;
    }
    setSubmitting(true);
    const result = await login(identifier.trim(), password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Invalid email/mobile number or password.');
      return;
    }
    pushMessage('Welcome back to FEXO.', 'success');
    router.push(safeNext());
  };

  return (
    <>
      <h1 className="fx-serif">Welcome Back</h1>
      <p className="fx-auth-lead">Sign in to your FEXO account</p>
      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="fx-form-error" role="alert">{error}</div>}
        <div className="fx-field">
          <label className="fx-label" htmlFor="login-id">Email / Mobile number</label>
          <input
            id="login-id"
            className="fx-control"
            autoComplete="username"
            placeholder="Enter your email or mobile number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoFocus
          />
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="login-password">Password</label>
          <div className="fx-control-wrap">
            <input
              id="login-password"
              className="fx-control"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="fx-control-icon" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <div className="fx-auth-row">
          <span className="fx-muted" style={{ fontSize: 12 }}>You&apos;ll stay signed in on this device.</span>
          <Link href="/accounts/password-reset" className="fx-link">Forgot password?</Link>
        </div>
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-block fx-btn-round" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
      <p className="fx-auth-foot">
        Don&apos;t have an account? <Link href="/accounts/register" className="fx-link">Create one</Link>
      </p>
    </>
  );
}
