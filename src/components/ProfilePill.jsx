const CATEGORY_STYLES = {
  interest:    { bg: 'rgba(200,149,108,0.12)', text: '#c8956c' },
  aesthetic:   { bg: 'rgba(160,152,144,0.12)', text: '#a09890' },
  personality: { bg: 'rgba(143,163,138,0.12)', text: '#8fa38a' },
  budget:      { bg: 'rgba(138,131,128,0.12)', text: '#8a8380' },
  context:     { bg: 'rgba(255,255,255,0.06)', text: '#8a8380' },
  merchant:    { bg: 'rgba(130,170,130,0.10)', text: '#7a9a7a' },
};

export function ProfilePill({ label, category }) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.context;
  return (
    <span
      className="inline-block text-[10px] uppercase tracking-[0.08em] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}
