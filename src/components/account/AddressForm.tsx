'use client';

// Address entry used by Saved Addresses and Checkout. "Street / area" and
// the optional landmark share the address's second line.

import { useState } from 'react';
import type { AddressInput } from '@/context/AuthContext';
import type { Address } from '@/lib/types';

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

interface FormState {
  full_name: string;
  phone: string;
  line1: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

function fromAddress(a?: Address, defaults?: Partial<FormState>): FormState {
  const [street, landmark] = (a?.line2 ?? '').split(' · Near ');
  return {
    full_name: a?.full_name ?? defaults?.full_name ?? '',
    phone: a?.phone ?? defaults?.phone ?? '',
    line1: a?.line1 ?? '',
    street: street ?? '',
    landmark: landmark ?? '',
    city: a?.city ?? '',
    state: a?.state ?? '',
    postal_code: a?.postal_code ?? '',
    is_default: a?.is_default ?? defaults?.is_default ?? false,
  };
}

export function toAddressInput(f: FormState): AddressInput {
  return {
    address_type: 'shipping',
    full_name: f.full_name.trim(),
    phone: f.phone.trim(),
    line1: f.line1.trim(),
    line2: [f.street.trim(), f.landmark.trim() && `Near ${f.landmark.trim()}`].filter(Boolean).join(' · '),
    city: f.city.trim(),
    state: f.state,
    postal_code: f.postal_code.trim(),
    country: 'India',
    is_default: f.is_default,
  };
}

export default function AddressForm({
  initial,
  defaults,
  submitLabel,
  saveLabel = 'Make this my default address',
  onSubmit,
  onCancel,
}: {
  initial?: Address;
  defaults?: Partial<FormState>;
  submitLabel: string;
  saveLabel?: string;
  onSubmit: (input: AddressInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [f, setF] = useState<FormState>(() => fromAddress(initial, defaults));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.full_name.trim()) errs.full_name = 'Enter the full name.';
    if (f.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit mobile number.';
    if (!f.line1.trim()) errs.line1 = 'Enter the house / flat / building.';
    if (!f.street.trim()) errs.street = 'Enter the street or area.';
    if (!f.city.trim()) errs.city = 'Enter the city.';
    if (!f.state) errs.state = 'Choose a state.';
    if (!/^\d{6}$/.test(f.postal_code.trim())) errs.postal_code = 'Enter a 6-digit PIN code.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSubmit(toAddressInput(f));
    } finally {
      setSaving(false);
    }
  };

  const field = (k: keyof FormState, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <div className="fx-field">
      <label className="fx-label" htmlFor={`addr-${k}`}>
        {label}
        {required ? <span className="req">*</span> : <span className="fx-muted" style={{ textTransform: 'none', fontWeight: 400 }}> (optional)</span>}
      </label>
      <input id={`addr-${k}`} className="fx-control" value={String(f[k])} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <p className="fx-error">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div className="fx-field-row">
        {field('full_name', 'Full name', { autoComplete: 'name', placeholder: 'e.g. Rahul Sharma' })}
        {field('phone', 'Mobile number', { type: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210' })}
      </div>
      {field('line1', 'House / flat / building', { autoComplete: 'address-line1', placeholder: 'Flat no., floor, building name' })}
      {field('street', 'Street / area / locality', { autoComplete: 'address-line2', placeholder: 'Street name, colony, sector' })}
      {field('landmark', 'Landmark', { placeholder: 'e.g. near the metro station' }, false)}
      <div className="fx-field-row-3">
        {field('city', 'City', { autoComplete: 'address-level2' })}
        <div className="fx-field">
          <label className="fx-label" htmlFor="addr-state">State<span className="req">*</span></label>
          <select id="addr-state" className="fx-control" value={f.state} onChange={set('state')} aria-invalid={!!errors.state}>
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="fx-error">{errors.state}</p>}
        </div>
        {field('postal_code', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code', placeholder: '400001' })}
      </div>
      <div className="fx-field">
        <label className="fx-check">
          <input type="checkbox" checked={f.is_default} onChange={set('is_default')} />
          {saveLabel}
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="fx-btn fx-btn-solid fx-btn-round" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="fx-btn fx-btn-round" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function AddressLines({ a }: { a: Address }) {
  return (
    <>
      <strong>{a.full_name}</strong>
      <p>
        {a.phone}
        <br />
        {a.line1}
        {a.line2 ? `, ${a.line2}` : ''}
        <br />
        {a.city}, {a.state} – {a.postal_code}
      </p>
    </>
  );
}
