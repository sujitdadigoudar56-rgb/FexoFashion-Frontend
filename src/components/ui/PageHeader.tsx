// Ports `.fx-page-header` — used at the top of every interior page.

export default function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="fx-page-header">
      <div className="fx-container">
        <span className="fx-eyebrow">{eyebrow}</span>
        <h1 className="fx-serif">{title}</h1>
      </div>
    </div>
  );
}
