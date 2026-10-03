// Shown instantly on navigation while a page's data loads.
export default function Loading() {
  return (
    <div className="fx-container fx-route-loading" aria-busy="true" aria-label="Loading">
      <div className="fx-skeleton bar" />
      <div className="fx-skeleton" style={{ height: 18, width: '60%', marginBottom: 12 }} />
      <div className="fx-skeleton" style={{ height: 18, width: '40%', marginBottom: 32 }} />
      <div className="fx-skeleton" style={{ height: 320 }} />
    </div>
  );
}
