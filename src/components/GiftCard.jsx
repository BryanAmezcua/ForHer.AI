'use client';

import { ProductImage } from './ProductImage';
import { ProfilePill } from './ProfilePill';

function parseRating(raw) {
  if (typeof raw === 'number') return raw.toFixed(1);
  const match = String(raw).match(/([\d.]+)/);
  return match ? parseFloat(match[1]).toFixed(1) : raw;
}

export function GiftCard({ gift, index, isTopPick }) {
  return (
    <div
      className={`bg-white/[0.05] backdrop-blur-sm rounded-2xl overflow-hidden border flex flex-col animate-fade-up transition-all duration-300 hover:-translate-y-1 ${
        isTopPick
          ? 'border-copper/40 shadow-[0_0_20px_rgba(200,149,108,0.15),0_0_40px_rgba(200,149,108,0.08)] hover:shadow-[0_0_24px_rgba(200,149,108,0.25),0_0_48px_rgba(200,149,108,0.12)] ring-1 ring-copper/15'
          : 'border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
      }`}
      style={{ animationDelay: `${0.1 + index * 0.12}s` }}
    >
      {/* Product image */}
      <ProductImage
        src={gift.imageUrl}
        imageUrls={gift.imageUrls}
        alt={gift.name}
        fallbackColor={gift.imageBg}
      />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Tag + price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {gift.matchScore ? (
              <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-copper">
                &bull; {gift.matchScore}% Match
              </span>
            ) : (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: gift.ctaColor }}
                />
                <span className={`text-[10px] uppercase tracking-[0.12em] font-semibold ${
                  isTopPick ? 'text-copper' : 'text-warm-gray-light'
                }`}>
                  {gift.tag}
                </span>
              </>
            )}
          </div>
          <span className="text-sm font-bold text-foreground">
            {gift.price}
          </span>
        </div>

        {/* Product name */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-2">
          {gift.name}
        </h3>

        {/* Rating */}
        {gift.rating && (
          <div className="flex items-center gap-1 mb-2 text-warm-gray-light">
            <span className="text-amber-400 text-[11px] leading-none">&#9733;</span>
            <span className="text-[11px] font-medium">{parseRating(gift.rating)}</span>
          </div>
        )}

        {/* Pills */}
        {(gift.matchedAttributes?.length > 0 || gift.merchantBadges?.length > 0) ? (
          <div className="flex flex-wrap gap-1.5 mb-auto">
            {gift.matchedAttributes?.map((attr, i) => (
              <ProfilePill key={`fit-${i}`} label={attr.label} category={attr.category} />
            ))}
            {gift.merchantBadges?.map((badge, i) => (
              <ProfilePill key={`merch-${i}`} label={badge} category="merchant" />
            ))}
          </div>
        ) : (
          <div className="mb-auto" />
        )}

        {/* CTA button */}
        <button
          className="w-full mt-5 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:brightness-[0.92] hover:shadow-[0_4px_16px_rgba(200,149,108,0.2)] cursor-pointer"
          style={{ backgroundColor: gift.ctaColor }}
          onClick={() => {
            if (gift.url && gift.url !== '#') {
              window.open(gift.url, '_blank', 'noopener');
            }
          }}
        >
          {gift.ctaText}
        </button>
      </div>
    </div>
  );
}
