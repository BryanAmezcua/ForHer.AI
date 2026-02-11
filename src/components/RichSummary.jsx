export function RichSummary({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="text-foreground font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ));
      })}
    </p>
  );
}
