const ROWS = [
  { size: 'XS', chest: '34"', waist: '28"', length: '26"' },
  { size: 'S', chest: '36"', waist: '30"', length: '27"' },
  { size: 'M', chest: '38"', waist: '32"', length: '28"' },
  { size: 'L', chest: '40"', waist: '34"', length: '29"' },
  { size: 'XL', chest: '42"', waist: '36"', length: '30"' },
  { size: 'XXL', chest: '44"', waist: '38"', length: '31"' },
];

export default function SizeChart({ note }: { note?: string }) {
  return (
    <div style={{ marginTop: 12 }}>
      {note && <p className="fx-muted" style={{ lineHeight: 1.7, marginBottom: 14 }}>{note}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--fx-line)' }}>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Size</th>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Chest</th>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Waist</th>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Length</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.size} style={{ borderBottom: '1px solid var(--fx-line-soft)' }}>
              <td style={{ padding: '8px 4px' }}>{r.size}</td>
              <td className="fx-muted" style={{ padding: '8px 4px' }}>{r.chest}</td>
              <td className="fx-muted" style={{ padding: '8px 4px' }}>{r.waist}</td>
              <td className="fx-muted" style={{ padding: '8px 4px' }}>{r.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}