'use client';

export function RecipientCard({ recipient, onGetGifts, onEdit, onDelete }) {
  const profile = recipient.tasteProfile || {};
  const interests = profile.interests || [];
  const relationship = profile.recipient?.relationship || '';
  const birthday = recipient.birthday
    ? new Date(recipient.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="group bg-white/[0.05] border border-border rounded-2xl p-5 hover:border-copper/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{recipient.label}</h3>
          {relationship && (
            <p className="text-sm text-muted-foreground">{relationship}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(recipient._id)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(recipient._id)}
            className="p-2 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {interests.slice(0, 4).map((interest, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full bg-copper/10 text-copper"
            >
              {interest}
            </span>
          ))}
          {interests.length > 4 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-muted-foreground">
              +{interests.length - 4} more
            </span>
          )}
        </div>
      )}

      {birthday && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <rect x="1" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 4V2M11 4V2M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Birthday: {birthday}
        </p>
      )}

      <button
        onClick={() => onGetGifts(recipient)}
        className="w-full px-4 py-2.5 rounded-xl bg-copper text-white text-sm font-semibold hover:bg-copper/90 transition-all cursor-pointer"
      >
        Get gifts
      </button>
    </div>
  );
}
