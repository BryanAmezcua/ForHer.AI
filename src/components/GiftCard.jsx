'use client';

import { ProductImage } from './ProductImage';
import { ProfilePill } from './ProfilePill';
import { MatchRing } from './MatchRing';

function parseRating(raw) {
  if (typeof raw === 'number') return raw.toFixed(1);
  const match = String(raw).match(/([\d.]+)/);
  return match ? parseFloat(match[1]).toFixed(1) : raw;
}

/* ── Badge icon SVGs ── */
function BadgeIcon({ type }) {
  const size = 12;
  if (type === 'confidence') {
    // Sparkle
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className="text-copper flex-shrink-0">
        <path d="M8 0l1.796 5.204L15 6.5l-4 3.296L12.472 16 8 12.4 3.528 16 5 9.796 1 6.5l5.204-1.296z" />
      </svg>
    );
  }
  if (type === 'social') {
    // Heart
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className="text-warm-gray-light flex-shrink-0">
        <path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4.5 3.5 3.5 0 0 1 13.5 7C13.5 10.5 8 14 8 14z" />
      </svg>
    );
  }
  if (type === 'occasion') {
    // Gift box
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8fa38a] flex-shrink-0">
        <rect x="2" y="7" width="12" height="7" rx="1" />
        <rect x="1" y="5" width="14" height="2.5" rx="0.5" />
        <line x1="8" y1="5" x2="8" y2="14" />
        <path d="M8 5C8 5 6 3 5 2.5S3 2.5 3 3.5 4 5 5 5" />
        <path d="M8 5C8 5 10 3 11 2.5S13 2.5 13 3.5 12 5 11 5" />
      </svg>
    );
  }
  // Fallback: dot (matches original behavior)
  return null;
}

const BADGE_COLORS = {
  confidence: 'text-copper',
  social: 'text-warm-gray-light',
  occasion: 'text-[#8fa38a]',
};

export function GiftCard({ gift, index, isTopPick }) {
  const hasBadge = gift.badgeLabel && gift.badgeType;

  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col animate-card-entrance card-hover-lift ${
        isTopPick
          ? 'card-glow-border backdrop-blur-sm'
          : 'bg-white/[0.05] backdrop-blur-sm border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)]'
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
        {/* Tag / Badge + price + match ring */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 animate-badge-pop min-w-0">
            {hasBadge ? (
              <>
                <BadgeIcon type={gift.badgeType} />
                <span className={`text-[10px] uppercase tracking-[0.08em] font-semibold truncate ${
                  BADGE_COLORS[gift.badgeType] || 'text-warm-gray-light'
                }`}>
                  {gift.badgeLabel}
                </span>
              </>
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
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {gift.matchScore >= 85 && (
              <MatchRing score={gift.matchScore} />
            )}
            <span className="text-sm font-bold text-foreground">
              {gift.price}
            </span>
          </div>
        </div>

        {/* Product name */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1">
          {gift.name}
        </h3>

        {/* Reaction prediction line */}
        {gift.reactionLine && (
          <p className="text-[12px] italic text-warm-gray-light/80 mb-2 leading-relaxed">
            &ldquo;{gift.reactionLine}&rdquo;
          </p>
        )}

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
          className="w-full mt-5 py-3 rounded-xl text-white text-sm font-semibold cta-hover active:scale-[0.98] cursor-pointer"
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
