import Link from "next/link";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-surface hover:text-ink"
    >
      {children}
    </Link>
  );
};

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-app/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md px-2 py-1 text-sm font-semibold tracking-tight text-ink hover:bg-surface"
          >
            Top Repos Today
          </Link>
          <div className="hidden text-sm text-ink-muted md:block">
            Daily picks. Structured summaries. No repeats.
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink href="/archive">Archive</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
      </div>
    </header>
  );
}

