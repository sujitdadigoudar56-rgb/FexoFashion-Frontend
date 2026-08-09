// Ports `.fx-stars` — the original templates print a static 5-star row as
// decoration (`{% for i in "12345" %}` always renders 5 stars, regardless
// of actual rating) except in the review list, which prints "N ★". Both
// forms are reproduced here via the optional `value` prop.

export default function StarRating({ value }: { value?: number }) {
  if (value === undefined) {
    return <span className="fx-stars">{'★'.repeat(5)}</span>;
  }
  return (
    <span className="fx-stars">
      {value} {'★'}
    </span>
  );
}
