import type { DriftVector } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface RadarChartProps {
  vector: DriftVector;
  size?: number;
}

const DIMENSIONS = [
  { key: 'intent' as const, label: 'Intent' },
  { key: 'instructionOverride' as const, label: 'Override' },
  { key: 'dataExtraction' as const, label: 'Extract' },
  { key: 'roleHijack' as const, label: 'Hijack' },
  { key: 'encodingEvasion' as const, label: 'Encode' },
];

export function RadarChart({ vector, size = 220 }: RadarChartProps) {
  const { resolved } = useTheme();
  const center = size / 2;
  const radius = size / 2 - 36;
  const angleStep = (Math.PI * 2) / DIMENSIONS.length;
  const isDark = resolved === 'dark';

  const gridColor = isDark ? '#1e2836' : '#e2e8f0';
  const labelColor = isDark ? '#7a8a9c' : '#64748b';
  const axisColor = isDark ? '#1e2836' : '#cbd5e1';

  function getPoint(value: number, index: number) {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    };
  }

  function getLabelPoint(index: number) {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * (radius + 18),
      y: center + Math.sin(angle) * (radius + 18),
    };
  }

  const dataPoints = DIMENSIONS.map((dim, i) =>
    getPoint(vector[dim.key], i)
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid rings */}
      {[20, 40, 60, 80, 100].map((level) => {
        const points = DIMENSIONS.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (level / 100) * radius;
          return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke={gridColor}
            strokeWidth="1"
            strokeDasharray={level === 100 ? '0' : '3 3'}
          />
        );
      })}

      {/* Axes */}
      {DIMENSIONS.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke={axisColor}
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(0, 212, 255, 0.12)"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => {
        const val = vector[DIMENSIONS[i].key];
        const color = val >= 70 ? '#ff4757' : val >= 35 ? '#f5a623' : '#26de81';
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={color}
            stroke={isDark ? '#0a0e14' : '#ffffff'}
            strokeWidth="2"
            className="transition-all duration-300"
          />
        );
      })}

      {/* Labels */}
      {DIMENSIONS.map((dim, i) => {
        const lp = getLabelPoint(i);
        return (
          <text
            key={dim.key}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill={labelColor}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="500"
          >
            {dim.label}
          </text>
        );
      })}

      {/* Value labels on data points */}
      {DIMENSIONS.map((dim, i) => {
        const p = dataPoints[i];
        const lp = getLabelPoint(i);
        const val = vector[dim.key];
        if (val === 0) return null;
        const lx = p.x + (lp.x - center) * 0.12;
        const ly = p.y + (lp.y - center) * 0.12;
        return (
          <text
            key={`val-${dim.key}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill={isDark ? '#c5d0dc' : '#1a202c'}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="600"
          >
            {val}
          </text>
        );
      })}
    </svg>
  );
}
