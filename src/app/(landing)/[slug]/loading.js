import { GiftCardSkeleton } from '@/components/GiftCardSkeleton';

export default function LandingLoading() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#1a1816] via-[#1c1a17] to-[#1e1b18] relative overflow-hidden">
      {/* Grain texture */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="max-w-[1100px] mx-auto flex items-center justify-center px-4 sm:px-6 py-4 border-b border-border/50">
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
            GiftHer.ai
          </span>
        </nav>

        {/* Hero skeleton */}
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
          <div className="h-8 sm:h-10 w-3/4 rounded-full bg-border/50 animate-pulse mx-auto mb-4" />
          <div className="space-y-2 max-w-[500px] mx-auto">
            <div className="h-4 w-full rounded-full bg-border/40 animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-border/40 animate-pulse mx-auto" />
          </div>
        </div>

        {/* Gift grid skeleton */}
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-6 pb-12">
          <div className="space-y-12">
            {[0, 1, 2].map(rowIdx => (
              <div key={rowIdx}>
                <div className="h-5 w-48 rounded-full bg-border/50 animate-pulse mb-4" />
                <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3 md:gap-6">
                  {[0, 1, 2].map(j => (
                    <div key={j} className="shrink-0 w-[280px] md:w-auto">
                      <GiftCardSkeleton index={rowIdx * 3 + j} isTopPick={j === 0} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
