import { useTheme } from '@/contexts/ThemeContext';

interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function MiniBarChart({ data, height = 100 }: MiniBarChartProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const max = Math.max(...data.map((d) => d.value), 1);
  const labelColor = isDark ? '#7a8a9c' : '#64748b';
  const trackColor = isDark ? '#1e2836' : '#e2e8f0';

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = Math.max(2, (item.value / max) * (height - 24));
        const color = item.color || '#00d4ff';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end">
            <span
              className="text-[10px] font-mono font-semibold"
              style={{ color }}
            >
              {item.value}
            </span>
            <div
              className="w-full rounded-t transition-all duration-500 ease-soc relative overflow-hidden"
              style={{
                height: barHeight,
                backgroundColor: color,
                opacity: 0.85,
                minHeight: 2,
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: trackColor }}
              />
            </div>
            <span
              className="text-[9px] font-mono truncate w-full text-center"
              style={{ color: labelColor }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
