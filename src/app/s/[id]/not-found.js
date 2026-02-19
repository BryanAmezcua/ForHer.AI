export default function NotFound() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18] flex items-center justify-center">
      <div className="text-center px-4">
        <svg width="20" height="20" viewBox="0 0 20 20" className="text-copper mx-auto mb-4 opacity-70">
          <path
            d="M10 0C10 6 14 10 20 10C14 10 10 14 10 20C10 14 6 10 0 10C6 10 10 6 10 0Z"
            fill="currentColor"
          />
        </svg>
        <h2 className="text-xl font-bold text-foreground mb-2">
          This gift list has expired or doesn&apos;t exist
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          Gift lists are available for 7 days after creation.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3.5 rounded-xl bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all duration-300 shadow-[0_4px_16px_rgba(200,149,108,0.25)]"
        >
          Find gifts for someone
        </a>
      </div>
    </main>
  );
}
