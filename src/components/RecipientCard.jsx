'use client';

export function RecipientCard({ recipient, index = 0, onGetGifts, onEdit, onDelete }) {
  const profile = recipient.tasteProfile || {};
  const interests = profile.interests || [];
  const relationship = profile.recipient?.relationship || '';
  const aestheticStyle = profile.aesthetic?.style || '';
  const birthday = recipient.birthday
    ? new Date(recipient.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;
  const giftCount = recipient.giftHistory?.length || 0;
  const initial = (recipient.label || '?')[0].toUpperCase();

  return (
    <div
      className="group rounded-2xl overflow-hidden flex flex-col animate-card-entrance card-hover-lift bg-white/[0.05] backdrop-blur-sm border border-border/30 shadow-[0_2px_24px_rgba(0,0,0,0.3)]"
      style={{ animationDelay: `${0.1 + index * 0.12}s` }}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Header: avatar + name + actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-copper/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-copper font-semibold">{initial}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground leading-tight">{recipient.label}</h3>
              {relationship && (
                <p className="text-sm text-muted-foreground">{relationship}</p>
              )}
            </div>
          </div>
          <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(recipient._id)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-lg transition-all cursor-pointer"
              title="Edit"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(recipient._id)}
              className="p-2 text-muted-foreground hover:text-red-400 hover:bg-white/[0.06] rounded-lg transition-all cursor-pointer"
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Interest pills */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {interests.slice(0, 4).map((interest, i) => (
              <span
                key={i}
                className="inline-block text-[10px] uppercase tracking-[0.08em] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(200,149,108,0.12)', color: '#c8956c' }}
              >
                {interest}
              </span>
            ))}
            {interests.length > 4 && (
              <span className="inline-block text-[10px] uppercase tracking-[0.08em] font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] text-muted-foreground">
                +{interests.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Aesthetic style pill */}
        {aestheticStyle && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span
              className="inline-block text-[10px] uppercase tracking-[0.08em] font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(160,152,144,0.12)', color: '#a09890' }}
            >
              {aestheticStyle}
            </span>
          </div>
        )}

        {/* Meta row: birthday + gift count */}
        {(birthday || giftCount > 0) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            {birthday && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="opacity-60">
                  <rect x="1" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 4V2M11 4V2M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {birthday}
              </span>
            )}
            {giftCount > 0 && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="opacity-60">
                  <rect x="2" y="7" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="1" y="5" width="14" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="8" y1="5" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {giftCount} {giftCount === 1 ? 'gift' : 'gifts'} found
              </span>
            )}
          </div>
        )}

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={() => onGetGifts(recipient)}
          className="w-full py-3 rounded-xl bg-copper text-white text-sm font-semibold cta-hover active:scale-[0.98] transition-all cursor-pointer"
        >
          Find gifts
        </button>
      </div>
    </div>
  );
}
