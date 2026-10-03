import { useTheme } from '@/contexts/ThemeContext';

interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
}

export function Gauge({ value, max = 100, size = 160, label }: GaugeProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const center = size / 2;
  const strokeWidth = 14;
  const radius = size / 2 - strokeWidth - 4;
  const normalized = Math.max(0, Math.min(max, value));
  const percentage = normalized / max;

  const startAngle = -135;
  const sweepAngle = 270;
  const currentAngle = startAngle + sweepAngle * percentage;

  const trackColor = isDark ? '#1e2836' : '#e2e8f0';
  const labelColor = isDark ? '#7a8a9c' : '#64748b';
  const textColor = isDark ? '#e8eef5' : '#0f172a';

  const valueColor =
    normalized >= 70 ? '#ff4757' : normalized >= 35 ? '#f5a623' : '#26de81';

  function arcPath(startDeg: number, endDeg: number, r: number) {
    const start = polarToCartesian(center, center, r, endDeg);
    const end = polarToCartesian(center, center, r, startDeg);
    const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Track */}
        <path
          d={arcPath(startAngle, startAngle + sweepAngle, radius)}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {normalized > 0 && (
          <path
            d={arcPath(startAngle, currentAngle, radius)}
            fill="none"
            stroke={valueColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500 ease-soc"
          />
        )}
        {/* Needle */}
        {normalized > 0 && (() => {
          const tip = polarToCartesian(center, center, radius - 2, currentAngle);
          return (
            <line
              x1={center}
              y1={center}
              x2={tip.x}
              y2={tip.y}
              stroke={valueColor}
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-all duration-500 ease-soc"
            />
          );
        })()}
        {/* Center dot */}
        <circle cx={center} cy={center} r="4" fill={valueColor} />
        {/* Value text */}
        <text
          x={center}
          y={center + 28}
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill={textColor}
          fontFamily="Inter, sans-serif"
        >
          {Math.round(normalized)}
        </text>
      </svg>
      {label && (
        <span
          className="text-xs font-mono mt-1"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
