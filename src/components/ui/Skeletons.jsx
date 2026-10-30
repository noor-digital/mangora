export function SkeletonCard() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--cover" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--short" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="manga-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/** Route-level fallback shown while a lazy page chunk loads. */
export function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status" aria-label="Loading">
      <div className="skeleton page-skeleton__hero" />
      <div className="container">
        <div className="skeleton skeleton--title" />
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}
