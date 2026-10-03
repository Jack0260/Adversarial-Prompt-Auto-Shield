import type { SparklinePoint } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface SparklineProps {
  data: SparklinePoint[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  data,
  width = 200,
  height = 50,
  color = '#00d4ff',
}: SparklineProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const gridColor = isDark ? '#1e2836' : '#e2e8f0';

  if (data.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={gridColor} strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d.value - minVal) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

  const gradientId = `sparkline-grad-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = (data.length - 1) * stepX;
        const y = height - ((last.value - minVal) / range) * (height - 6) - 3;
        return (
          <circle cx={x} cy={y} r="3" fill={color}>
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
}
