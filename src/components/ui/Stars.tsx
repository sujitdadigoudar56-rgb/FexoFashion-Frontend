import { Star } from 'lucide-react';

/** Five-star row with partial fill to the nearest half. */
export default function Stars({ value, size = 13 }: { value: number; size?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="fx-stars-row" aria-label={`${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rounded >= n ? 1 : rounded >= n - 0.5 ? 0.5 : 0;
        return (
          <span key={n} style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
            <Star size={size} strokeWidth={1.5} aria-hidden />
            {fill > 0 && (
              <span style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, overflow: 'hidden', display: 'inline-flex' }}>
                <Star size={size} strokeWidth={1.5} fill="currentColor" aria-hidden />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
