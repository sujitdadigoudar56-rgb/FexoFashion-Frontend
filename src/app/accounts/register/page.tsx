'use client';

// Ports templates/accounts/register.html — POSTs to /api/accounts/register/.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

const emptyForm = { first_name: '', last_name: '', username: '', email: '', password1: '', password2: '' };

export default function RegisterPage() {
  const { register } = useAuth();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    pushMessage(`Welcome to FEXO, ${form.first_name}.`, 'success');
    router.push('/accounts/dashboard');
  };

  return (
    <div className="fx-auth-wrap">
      <h1 className="fx-serif">Create Account</h1>
      <p className="fx-sub">Join the FEXO inner circle.</p>
      <form onSubmit={handleSubmit}>
        <label className="fx-form-label">First Name</label>
        <input type="text" className="fx-input" required value={form.first_name} onChange={update('first_name')} />
        <label className="fx-form-label">Last Name</label>
        <input type="text" className="fx-input" value={form.last_name} onChange={update('last_name')} />
        <label className="fx-form-label">Username</label>
        <input type="text" className="fx-input" required value={form.username} onChange={update('username')} />
        <label className="fx-form-label">Email</label>
        <input type="email" className="fx-input" required value={form.email} onChange={update('email')} />
        <label className="fx-form-label">Password</label>
        <input type="password" className="fx-input" required value={form.password1} onChange={update('password1')} />
        <label className="fx-form-label">Confirm Password</label>
        <input type="password" className="fx-input" required value={form.password2} onChange={update('password2')} />
        {errors.length > 0 && (
          <ul style={{ color: '#e57373', fontSize: 13, marginBottom: 16 }}>
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-block" disabled={submitting}>
          {submitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
      <p className="fx-auth-switch">
        Already have an account? <Link href="/accounts/login">Sign in</Link>
      </p>
    </div>
  );
}
