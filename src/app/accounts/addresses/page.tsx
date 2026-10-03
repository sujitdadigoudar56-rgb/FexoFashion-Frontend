'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import AddressForm, { AddressLines } from '@/components/account/AddressForm';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';

function Addresses() {
  const { user, addresses, addAddress, updateAddress, removeAddress } = useAuth();
  const { pushMessage } = useMessages();
  const [editing, setEditing] = useState<number | 'new' | null>(addresses.length ? null : 'new');

  const run = async (fn: () => Promise<unknown>, ok: string, fail: string) => {
    try {
      await fn();
      pushMessage(ok, 'success');
      return true;
    } catch {
      pushMessage(fail, 'error');
      return false;
    }
  };

  const editingAddress = typeof editing === 'number' ? addresses.find((a) => a.id === editing) : undefined;

  return (
    <>
      <div className="fx-account-head">
        <div>
          <h1 className="fx-h-title">Saved Addresses</h1>
          <p>Manage your delivery addresses.</p>
        </div>
        {editing !== 'new' && (
          <button type="button" className="fx-btn fx-btn-sm fx-btn-round" onClick={() => setEditing('new')}>
            <Plus size={14} aria-hidden /> Add new address
          </button>
        )}
      </div>

      {addresses.length > 0 && (
        <div className="fx-address-grid" style={{ marginBottom: 32 }}>
          {addresses.map((a) => (
            <div key={a.id} className={`fx-address-card${a.is_default ? ' fx-on' : ''}`}>
              <div className="fx-address-tags">
                <span className="fx-pill">{a.address_type === 'billing' ? 'Billing' : 'Delivery'}</span>
                {a.is_default && <span className="fx-pill fx-pill-success">Default</span>}
              </div>
              <AddressLines a={a} />
              <div className="fx-address-actions">
                <button type="button" onClick={() => setEditing(a.id)}>Edit</button>
                <button
                  type="button"
                  className="muted"
                  onClick={() => {
                    if (window.confirm('Delete this address?')) run(() => removeAddress(a.id), 'Address deleted.', 'Could not delete that address.');
                  }}
                >
                  Delete
                </button>
                {!a.is_default && (
                  <button type="button" onClick={() => run(() => updateAddress(a.id, { is_default: true }), 'Default address updated.', 'Could not update the default address.')}>
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <section className="fx-panel fx-panel-pad">
          <h2 className="fx-h-title" style={{ fontSize: 24, marginBottom: 4 }}>{editing === 'new' ? 'Add New Address' : 'Edit Address'}</h2>
          <p className="fx-muted" style={{ fontSize: 13, marginBottom: 20 }}>Please fill in your delivery details accurately.</p>
          <AddressForm
            key={editing}
            initial={editingAddress}
            defaults={{ full_name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(), phone: user?.phone ?? '', is_default: addresses.length === 0 }}
            submitLabel={editing === 'new' ? 'Save address' : 'Update address'}
            onCancel={addresses.length ? () => setEditing(null) : undefined}
            onSubmit={async (input) => {
              const ok = await run(
                () => (editing === 'new' ? addAddress(input) : updateAddress(editing, input)),
                editing === 'new' ? 'Address saved.' : 'Address updated.',
                'Could not save that address — please check the details.'
              );
              if (ok) setEditing(null);
            }}
          />
        </section>
      )}
    </>
  );
}

export default function AddressesPage() {
  return (
    <AccountLayout active="addresses" crumbs={[{ label: 'Addresses' }]}>
      <Addresses />
    </AccountLayout>
  );
}
