'use client';

// Ports templates/accounts/profile.html — PATCHes /api/accounts/me/.
// (No avatar upload — the API doesn't expose that field yet.)

import { useState } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';
import RequireAuth from '@/components/account/RequireAuth';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const { pushMessage } = useMessages();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      pushMessage('Profile updated.', 'success');
    } catch {
      pushMessage('Could not update your profile — please try again.', 'error');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48 }}>
          <AccountSidebar active="profile" />
          <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
            <label className="fx-form-label">First Name</label>
            <input
              type="text"
              className="fx-input"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <label className="fx-form-label">Last Name</label>
            <input
              type="text"
              className="fx-input"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
            <label className="fx-form-label">Email</label>
            <input
              type="email"
              className="fx-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <label className="fx-form-label">Phone</label>
            <input
              type="text"
              className="fx-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button type="submit" className="fx-btn fx-btn-solid" style={{ marginTop: 16 }}>Save Changes</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
