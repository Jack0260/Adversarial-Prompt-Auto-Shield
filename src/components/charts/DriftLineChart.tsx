import type { DriftHistoryPoint } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface DriftLineChartProps {
  data: DriftHistoryPoint[];
  height?: number;
}

export function DriftLineChart({ data, height = 120 }: DriftLineChartProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const gridColor = isDark ? '#1e2836' : '#e2e8f0';
  const labelColor = isDark ? '#7a8a9c' : '#64748b';

  const width = 100;
  const keys = [
    { key: 'overall' as const, color: '#00d4ff', label: 'Overall' },
    { key: 'intent' as const, color: '#3b82f6', label: 'Intent' },
    { key: 'instructionOverride' as const, color: '#ff4757', label: 'Override' },
    { key: 'roleHijack' as const, color: '#f5a623', label: 'Hijack' },
    { key: 'dataExtraction' as const, color: '#a855f7', label: 'Extract' },
    { key: 'encodingEvasion' as const, color: '#26de81', label: 'Encode' },
  ];

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-xs text-soc-text-dim" style={{ height }}>
        Awaiting drift data samples...
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((level) => {
          const y = height - (level / 100) * (height - 8) - 4;
          return (
            <line
              key={level}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke={gridColor}
              strokeWidth="0.2"
              strokeDasharray="1 1"
            />
          );
        })}
        {/* Lines */}
        {keys.map((line) => {
          const stepX = width / (data.length - 1);
          const points = data
            .map((d, i) => {
              const x = i * stepX;
              const val = d[line.key] || 0;
              const y = height - (val / 100) * (height - 8) - 4;
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polyline
              key={line.key}
              points={points}
              fill="none"
              stroke={line.color}
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={line.key === 'overall' ? 1 : 0.5}
            />
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-1">
        {keys.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1 text-[9px] font-mono" style={{ color: labelColor }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
}
