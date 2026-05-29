export function ScoreBadge({ score }: { score: number }) {
  let style = "bg-[rgba(239,68,68,0.15)] text-[#EF4444]";
  let label = "Baixo";
  if (score >= 85) {
    style = "bg-[rgba(16,185,129,0.15)] text-[#10B981]";
    label = "Alto";
  } else if (score >= 60) {
    style = "bg-[rgba(245,158,11,0.15)] text-[#F59E0B]";
    label = "Médio";
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${style}`}
    >
      {Math.round(score)}
      <span className="opacity-70 font-medium">·</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}