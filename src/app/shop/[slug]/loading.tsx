// Product page skeleton.
export default function ProductLoading() {
  return (
    <div className="fx-container fx-route-loading" aria-busy="true" aria-label="Loading product">
      <div className="fx-skeleton" style={{ height: 14, width: 260, marginBottom: 24 }} />
      <div className="fx-pdp" style={{ padding: 0 }}>
        <div className="fx-skeleton" style={{ aspectRatio: '4 / 5' }} />
        <div>
          <div className="fx-skeleton" style={{ height: 32, width: '80%', marginBottom: 14 }} />
          <div className="fx-skeleton" style={{ height: 22, width: '35%', marginBottom: 28 }} />
          <div className="fx-skeleton" style={{ height: 180 }} />
        </div>
      </div>
    </div>
  );
}
