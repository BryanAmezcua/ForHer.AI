'use client';

import { ProductImage } from './ProductImage';
import { ProfilePill } from './ProfilePill';

export function GiftCard({ gift, index }) {
  return (
    <div
      className="bg-white/[0.05] backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_2px_24px_rgba(0,0,0,0.3)] border border-border/30 flex flex-col animate-fade-up"
      style={{ animationDelay: `${0.1 + index * 0.12}s` }}
    >
      {/* Product image */}
      <ProductImage
        src={gift.imageUrl}
        alt={gift.name}
        fallbackColor={gift.imageBg}
      />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Match score + price */}
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
                <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-warm-gray-light">
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

        {/* Taste profile pills */}
        {gift.matchedAttributes && gift.matchedAttributes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-auto">
            {gift.matchedAttributes.map((attr, i) => (
              <ProfilePill key={i} label={attr.label} category={attr.category} />
            ))}
          </div>
        )}

        {/* Spacer when no pills */}
        {(!gift.matchedAttributes || gift.matchedAttributes.length === 0) && (
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
