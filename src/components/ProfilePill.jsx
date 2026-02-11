const CATEGORY_STYLES = {
  interest:    { bg: 'rgba(143, 163, 138, 0.15)', text: '#8fa38a' },
  aesthetic:   { bg: 'rgba(182, 141, 122, 0.15)', text: '#b68d7a' },
  personality: { bg: 'rgba(168, 154, 142, 0.15)', text: '#a89a8e' },
  budget:      { bg: 'rgba(122, 118, 114, 0.15)', text: '#7a7672' },
  context:     { bg: 'rgba(240, 235, 229, 1)',     text: '#a89a8e' },
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
