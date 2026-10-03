// Product-grid skeleton while the shop listing loads.
export default function ShopLoading() {
  return (
    <div className="fx-container fx-route-loading" aria-busy="true" aria-label="Loading products">
      <div className="fx-skeleton bar" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,250px) 1fr', gap: 44 }}>
        <div className="fx-skeleton" style={{ height: 420 }} />
        <div className="grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="fx-skeleton card" />
          ))}
        </div>
      </div>
    </div>
  );
}
