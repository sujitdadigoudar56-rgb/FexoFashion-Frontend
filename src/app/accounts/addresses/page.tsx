'use client';

// Ports templates/accounts/addresses.html.

import { useState } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';
import RequireAuth from '@/components/account/RequireAuth';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

const emptyForm = {
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false,
  address_type: 'shipping' as const,
};

function AddressesContent() {
  const { addresses, addAddress, removeAddress } = useAuth();
  const { pushMessage } = useMessages();
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(form);
      pushMessage('Address saved.', 'success');
      setForm(emptyForm);
    } catch {
      pushMessage('Could not save that address — please try again.', 'error');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Addresses" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48 }}>
          <AccountSidebar active="addresses" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              {addresses.length === 0 && <p className="fx-muted">No addresses saved yet.</p>}
              {addresses.map((a) => (
                <div key={a.id} style={{ border: '1px solid var(--fx-line-soft)', padding: 20, marginBottom: 16 }}>
                  <strong>{a.full_name}</strong> {a.is_default && <span className="fx-muted">(Default)</span>}
                  <p className="fx-muted" style={{ fontSize: 13, margin: '8px 0' }}>
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                    <br />
                    {a.city}, {a.state} {a.postal_code}
                    <br />
                    {a.phone}
                  </p>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--fx-muted)', fontSize: 12, textDecoration: 'underline' }}
                    onClick={() => removeAddress(a.id).catch(() => pushMessage('Could not remove that address.', 'error'))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit}>
              <label className="fx-form-label">Full Name</label>
              <input type="text" className="fx-input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <label className="fx-form-label">Phone</label>
              <input type="text" className="fx-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <label className="fx-form-label">Address Line 1</label>
              <input type="text" className="fx-input" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              <label className="fx-form-label">Address Line 2</label>
              <input type="text" className="fx-input" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              <label className="fx-form-label">City</label>
              <input type="text" className="fx-input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <label className="fx-form-label">State</label>
              <input type="text" className="fx-input" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <label className="fx-form-label">Postal Code</label>
              <input type="text" className="fx-input" required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              <label className="fx-muted" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                />
                Set as default address
              </label>
              <button type="submit" className="fx-btn fx-btn-solid">Save Address</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AddressesPage() {
  return (
    <RequireAuth>
      <AddressesContent />
    </RequireAuth>
  );
}
