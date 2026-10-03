'use client';

// Create account — no username (the backend derives one from the email).
// After sign-up the customer lands on the homepage, not their orders.

import { CircleCheck, CircleX, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type RegisterInput, useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

const RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special char', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const empty: RegisterInput = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password1: '',
  password2: '',
  newsletter_opt_in: false,
};

export default function RegisterForm() {
  const { register } = useAuth();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [form, setForm] = useState<RegisterInput>(empty);
  const [agreed, setAgreed] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof RegisterInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local: Record<string, string[]> = {};
    if (!form.first_name.trim()) local.first_name = ['Enter your first name.'];
    if (!form.email.trim()) local.email = ['Enter your email address.'];
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) local.phone = ['Enter a valid mobile number.'];
    if (!RULES.every((r) => r.test(form.password1))) local.password1 = ['Your password must meet all the requirements below.'];
    if (form.password1 !== form.password2) local.password2 = ['Passwords do not match.'];
    if (!agreed) local.terms = ['Please accept the Terms & Conditions to continue.'];
    setErrors(local);
    if (Object.keys(local).length) return;

    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    pushMessage(`Welcome to FEXO, ${form.first_name}.`, 'success');
    router.push('/');
  };

  const err = (k: string) => errors[k]?.[0];

  return (
    <>
      <h1 className="fx-serif">Create Your FEXO Account</h1>
      <p className="fx-auth-lead">Track orders, save favourites and check out faster.</p>
      <form onSubmit={handleSubmit} noValidate>
        {err('form') && <div className="fx-form-error" role="alert">{err('form')}</div>}
        <div className="fx-field-row">
          <div className="fx-field">
            <label className="fx-label" htmlFor="r-first">First name<span className="req">*</span></label>
            <input id="r-first" className="fx-control" autoComplete="given-name" value={form.first_name} onChange={set('first_name')} aria-invalid={!!err('first_name')} />
            {err('first_name') && <p className="fx-error">{err('first_name')}</p>}
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="r-last">Last name</label>
            <input id="r-last" className="fx-control" autoComplete="family-name" value={form.last_name} onChange={set('last_name')} />
          </div>
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="r-email">Email address<span className="req">*</span></label>
          <input id="r-email" type="email" className="fx-control" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} aria-invalid={!!err('email')} />
          {err('email') && <p className="fx-error">{err('email')}</p>}
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="r-phone">Mobile number</label>
          <input id="r-phone" type="tel" className="fx-control" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} aria-invalid={!!err('phone')} />
          {err('phone') && <p className="fx-error">{err('phone')}</p>}
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="r-pw">Password<span className="req">*</span></label>
          <div className="fx-control-wrap">
            <input id="r-pw" type={show ? 'text' : 'password'} className="fx-control" autoComplete="new-password" value={form.password1} onChange={set('password1')} aria-invalid={!!err('password1')} />
            <button type="button" className="fx-control-icon" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide passwords' : 'Show passwords'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {err('password1') && <p className="fx-error">{err('password1')}</p>}
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="r-pw2">Confirm password<span className="req">*</span></label>
          <input id="r-pw2" type={show ? 'text' : 'password'} className="fx-control" autoComplete="new-password" value={form.password2} onChange={set('password2')} aria-invalid={!!err('password2')} />
          {err('password2') && <p className="fx-error">{err('password2')}</p>}
        </div>
        <div className="fx-pw-rules">
          <p>Password requirements</p>
          <ul>
            {RULES.map((r) => {
              const ok = r.test(form.password1);
              return (
                <li key={r.label} className={ok ? 'ok' : undefined}>
                  {ok ? <CircleCheck size={13} aria-hidden /> : <CircleX size={13} aria-hidden />}
                  {r.label}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="fx-field">
          <label className="fx-check">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I agree to the <Link href="/terms" className="fx-link">Terms &amp; Conditions</Link> and{' '}
              <Link href="/privacy-policy" className="fx-link">Privacy Policy</Link>
            </span>
          </label>
          {err('terms') && <p className="fx-error">{err('terms')}</p>}
        </div>
        <div className="fx-field">
          <label className="fx-check">
            <input type="checkbox" checked={form.newsletter_opt_in} onChange={set('newsletter_opt_in')} />
            Send me FEXO updates and exclusive offers
          </label>
        </div>
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-block fx-btn-round" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="fx-auth-foot">
        Already have an account? <Link href="/accounts/login" className="fx-link">Sign in</Link>
      </p>
    </>
  );
}
