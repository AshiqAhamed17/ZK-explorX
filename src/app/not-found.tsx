import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <span className="text-5xl">🔍</span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Nothing here
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That page or ecosystem doesn&apos;t exist. It may have been renamed or
        isn&apos;t tracked yet.
      </p>
      <Link
        href="/ecosystems"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Browse ecosystems
      </Link>
    </div>
  );
}
