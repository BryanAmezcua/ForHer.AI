export function GiftCardSkeleton({ index, isTopPick }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col animate-card-entrance ${
        isTopPick
          ? 'card-glow-border'
          : 'bg-white/[0.05] border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)]'
      }`}
      style={{ animationDelay: `${0.1 + index * 0.12}s` }}
    >
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#252220]">
        <div className="absolute inset-0 skeleton-shimmer-warm" />
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Match score + price */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 rounded-full bg-border/60 skeleton-shimmer-warm" />
          <div className="h-4 w-12 rounded-full bg-border/60 skeleton-shimmer-warm" />
        </div>

        {/* Product name */}
        <div className="space-y-1.5 mb-3">
          <div className="h-4 w-3/4 rounded-full bg-border/60 skeleton-shimmer-warm" />
          <div className="h-4 w-1/2 rounded-full bg-border/60 skeleton-shimmer-warm" />
        </div>

        {/* Pill placeholders */}
        <div className="flex gap-1.5 mb-auto">
          <div className="h-5 w-28 rounded-full bg-border/40 skeleton-shimmer-warm" />
          <div className="h-5 w-20 rounded-full bg-border/40 skeleton-shimmer-warm" />
        </div>

        {/* CTA button placeholder */}
        <div className="w-full mt-5 h-11 rounded-xl bg-border/50 skeleton-shimmer-warm" />
      </div>
    </div>
  );
}
