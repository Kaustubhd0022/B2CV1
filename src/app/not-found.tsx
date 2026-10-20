import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto mt-16 max-w-lg px-4 text-center" role="status">
      <p className="font-serif text-section font-semibold text-forest">TattvaCo</p>
      <h1 className="mt-6 font-serif text-page font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-support text-muted">The link may be wrong, or the item is no longer available.</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-semibold text-on-forest">
        Home
      </Link>
    </main>
  );
}
