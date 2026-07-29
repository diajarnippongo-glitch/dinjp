interface RadarChartProps {
  scores: Record<string, number>;
  label: string;
  color: 'blue' | 'red';
  size?: number;
  showMetrics?: boolean;
  dark?: boolean;
}

export default function RadarChart({
  scores,
  label,
  color,
  size = 260,
  showMetrics = false,
  dark = false,
}: RadarChartProps) {
  const axes = Object.keys(scores);
  const center = size / 2;
  const radius = size / 2 - 44;
  const n = axes.length;
  const strokeColor = color === 'blue' ? '#3b82f6' : '#ef4444';
  const fillColor = color === 'blue' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const ringStroke = dark ? '#334155' : '#e2e8f0';
  const axisStroke = dark ? '#334155' : '#e2e8f0';
  const labelFill = dark ? '#94a3b8' : '#475569';
  const metricBg = dark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-100';
  const metricLabel = dark ? 'text-slate-500' : 'text-slate-400';
  const metricValue = dark ? 'text-white' : 'text-slate-800';

  function pointFor(value: number, index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  }

  function labelPoint(index: number, offset = 24) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return { x: center + (radius + offset) * Math.cos(angle), y: center + (radius + offset) * Math.sin(angle) };
  }

  const points = axes.map((_, i) => pointFor(scores[axes[i]], i));
  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  const rings = [0.25, 0.5, 0.75, 1];
  const vals = Object.values(scores);
  const metrics = showMetrics
    ? { highest: Math.max(...vals), lowest: Math.min(...vals), average: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {rings.map((ring) => {
            const pts = axes.map((_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              return { x: center + radius * ring * Math.cos(angle), y: center + radius * ring * Math.sin(angle) };
            });
            return <polygon key={ring} points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={ringStroke} strokeWidth="1" />;
          })}
          {axes.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke={axisStroke} strokeWidth="1" />;
          })}
          <path d={toPath(points)} fill={fillColor} stroke={strokeColor} strokeWidth="2" />
          {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={strokeColor} />)}
          {axes.map((axis, i) => {
            const lp = labelPoint(i);
            return (
              <text key={axis} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-semibold" fill={labelFill}>
                {axis.length > 14 ? axis.slice(0, 12) + '…' : axis}
              </text>
            );
          })}
        </svg>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: strokeColor }} />
          <span className={`text-xs font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
        </div>
      </div>

      {metrics && (
        <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 text-center">
          <div className={`rounded-lg px-3 py-2 border ${metricBg}`}>
            <p className={`text-[10px] font-medium uppercase ${metricLabel}`}>Tertinggi</p>
            <p className={`text-lg font-bold ${metricValue}`}>{metrics.highest}%</p>
          </div>
          <div className={`rounded-lg px-3 py-2 border ${metricBg}`}>
            <p className={`text-[10px] font-medium uppercase ${metricLabel}`}>Terendah</p>
            <p className={`text-lg font-bold ${metricValue}`}>{metrics.lowest}%</p>
          </div>
          <div className={`rounded-lg px-3 py-2 border ${metricBg}`}>
            <p className={`text-[10px] font-medium uppercase ${metricLabel}`}>Rata-rata</p>
            <p className={`text-lg font-bold ${metricValue}`}>{metrics.average}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
