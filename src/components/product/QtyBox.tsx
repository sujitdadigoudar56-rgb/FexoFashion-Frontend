'use client';

// Ports `.fx-qty-box` — the stepper used on the cart and product pages.

export default function QtyBox({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="fx-qty-box">
      <button type="button" className="fx-qty-minus" onClick={() => onChange(Math.max(min, value - 1))}>
        &minus;
      </button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value || String(min), 10) || min))}
      />
      <button type="button" className="fx-qty-plus" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
