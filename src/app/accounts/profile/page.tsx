'use client';

import { Eye, EyeOff, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import AccountLayout, { Avatar } from '@/components/account/AccountLayout';
import { fieldErrors, useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';

function Profile() {
  const { user, updateProfile, uploadAvatar, changePassword } = useAuth();
  const { pushMessage } = useMessages();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const blank = {
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    date_of_birth: user?.date_of_birth ?? '',
  };
  const [form, setForm] = useState(blank);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string[]>>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await updateProfile({ ...form, date_of_birth: form.date_of_birth || null });
      pushMessage('Profile updated.', 'success');
      setEditing(false);
    } catch (err) {
      setErrors(err instanceof ApiError ? fieldErrors(err.body) : { form: ['Could not update your profile.'] });
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      pushMessage('Images must be 2 MB or smaller.', 'error');
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
      pushMessage('Profile photo updated.', 'success');
    } catch (err) {
      pushMessage(err instanceof Error ? err.message : 'Could not upload that photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      setPwErrors({ confirm: ['Passwords do not match.'] });
      return;
    }
    setPwSaving(true);
    setPwErrors({});
    try {
      await changePassword(pw.current, pw.next);
      pushMessage('Password changed.', 'success');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwErrors(err instanceof ApiError ? fieldErrors(err.body) : { form: ['Could not change your password.'] });
    } finally {
      setPwSaving(false);
    }
  };

  const err = (k: string) => errors[k]?.[0];

  return (
    <>
      <div className="fx-account-head">
        <div>
          <h1 className="fx-h-title">My Profile</h1>
          <p>Manage your personal details and account credentials.</p>
        </div>
        {!editing && (
          <button type="button" className="fx-btn fx-btn-sm fx-btn-round" onClick={() => { setForm(blank); setEditing(true); }}>
            <Pencil size={13} aria-hidden /> Edit profile
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <Avatar className="fx-avatar fx-avatar-xl" />
        <div>
          <button type="button" className="fx-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Change photo'}
          </button>
          <p className="fx-muted" style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG or WebP. Max size 2 MB.</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPhoto} />
        </div>
      </div>

      <form onSubmit={save} noValidate>
        {err('form') && <div className="fx-form-error">{err('form')}</div>}
        <div className="fx-field-row">
          <div className="fx-field">
            <label className="fx-label" htmlFor="p-first">First name</label>
            <input id="p-first" className="fx-control" value={editing ? form.first_name : user?.first_name ?? ''} onChange={set('first_name')} disabled={!editing} />
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="p-last">Last name</label>
            <input id="p-last" className="fx-control" value={editing ? form.last_name : user?.last_name ?? ''} onChange={set('last_name')} disabled={!editing} />
          </div>
        </div>
        <div className="fx-field-row">
          <div className="fx-field">
            <label className="fx-label" htmlFor="p-email">Email address</label>
            <input id="p-email" type="email" className="fx-control" value={editing ? form.email : user?.email ?? ''} onChange={set('email')} disabled={!editing} aria-invalid={!!err('email')} />
            {err('email') && <p className="fx-error">{err('email')}</p>}
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="p-phone">Mobile number</label>
            <input id="p-phone" type="tel" className="fx-control" value={editing ? form.phone : user?.phone ?? ''} onChange={set('phone')} disabled={!editing} placeholder="+91 98765 43210" />
          </div>
        </div>
        <div className="fx-field-row">
          <div className="fx-field">
            <label className="fx-label" htmlFor="p-dob">Date of birth</label>
            <input id="p-dob" type="date" className="fx-control" value={editing ? form.date_of_birth : user?.date_of_birth ?? ''} onChange={set('date_of_birth')} disabled={!editing} max={new Date().toISOString().slice(0, 10)} />
            {err('date_of_birth') && <p className="fx-error">{err('date_of_birth')}</p>}
          </div>
          <div className="fx-field">
            <label className="fx-label">Member since</label>
            <input className="fx-control" value={user?.date_joined ? formatDate(user.date_joined) : ''} disabled readOnly />
          </div>
        </div>
        {editing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="fx-btn fx-btn-solid fx-btn-round" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" className="fx-btn fx-btn-round" onClick={() => { setEditing(false); setErrors({}); }} disabled={saving}>Cancel</button>
          </div>
        )}
      </form>

      <hr className="fx-divider" style={{ margin: '36px 0 28px' }} />

      <h2 className="fx-h-title" style={{ fontSize: 24 }}>Change Password</h2>
      <p className="fx-muted" style={{ fontSize: 13, margin: '4px 0 20px' }}>Use a strong password you don&apos;t use elsewhere.</p>
      <form onSubmit={savePassword} style={{ maxWidth: 420 }} noValidate>
        {pwErrors.form && <div className="fx-form-error">{pwErrors.form[0]}</div>}
        <div className="fx-field">
          <label className="fx-label" htmlFor="pw-current">Current password</label>
          <div className="fx-control-wrap">
            <input id="pw-current" type={showPw ? 'text' : 'password'} className="fx-control" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} aria-invalid={!!pwErrors.current_password} />
            <button type="button" className="fx-control-icon" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide passwords' : 'Show passwords'}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {pwErrors.current_password && <p className="fx-error">{pwErrors.current_password[0]}</p>}
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="pw-new">New password</label>
          <input id="pw-new" type={showPw ? 'text' : 'password'} className="fx-control" autoComplete="new-password" placeholder="At least 8 characters" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} aria-invalid={!!pwErrors.new_password} />
          {pwErrors.new_password && <p className="fx-error">{pwErrors.new_password.join(' ')}</p>}
        </div>
        <div className="fx-field">
          <label className="fx-label" htmlFor="pw-confirm">Confirm new password</label>
          <input id="pw-confirm" type={showPw ? 'text' : 'password'} className="fx-control" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} aria-invalid={!!pwErrors.confirm} />
          {pwErrors.confirm && <p className="fx-error">{pwErrors.confirm[0]}</p>}
        </div>
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-round" disabled={pwSaving || !pw.current || !pw.next}>
          {pwSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </>
  );
}

export default function ProfilePage() {
  return (
    <AccountLayout active="profile" crumbs={[{ label: 'Profile' }]}>
      <Profile />
    </AccountLayout>
  );
}
