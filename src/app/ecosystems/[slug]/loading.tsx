export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6">
      <div className="h-4 w-28 rounded bg-secondary" />
      <div className="mt-4 h-40 rounded-2xl bg-secondary" />
      <div className="mt-6 h-24 rounded-xl bg-secondary" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-secondary" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="h-64 rounded-xl bg-secondary lg:col-span-2" />
        <div className="h-64 rounded-xl bg-secondary" />
      </div>
    </div>
  );
}
