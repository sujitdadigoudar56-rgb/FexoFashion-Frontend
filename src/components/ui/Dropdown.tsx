'use client';

// Rounded, animated dropdown used in place of the native <select> square
// list (sort menu etc.). Keyboard: Enter/Space/↓ opens, ↑/↓ move, Enter
// selects, Escape closes.

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

export default function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const openMenu = () => {
    setFocus(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (v: string) => {
    setOpen(false);
    if (v !== value) onChange(v);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocus((f) => Math.min(options.length - 1, f + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus((f) => Math.max(0, f - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(options[focus].value);
    }
  };

  return (
    <div className={`fx-dropdown${open ? ' fx-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="fx-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span>
          {label && <span className="fx-dropdown-label">{label}:</span>}
          {current?.label}
        </span>
        <ChevronDown size={16} className="fx-dropdown-chevron" aria-hidden />
      </button>
      <div className="fx-dropdown-menu" role="listbox" id={listId} aria-label={label}>
        {options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={o.value === value}
            tabIndex={-1}
            className={`fx-dropdown-option${focus === i ? ' fx-focus' : ''}`}
            onMouseEnter={() => setFocus(i)}
            onClick={() => choose(o.value)}
          >
            {o.label}
            {o.value === value && <Check size={14} aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}
