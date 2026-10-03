import { Shield, AlertTriangle, ScanLine, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useShield } from '@/contexts/ShieldContext';
import { Sparkline } from '@/components/charts/Sparkline';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; up: boolean };
  accent: string;
  children?: ReactNode;
}

function MetricCard({ icon, label, value, trend, accent, children }: MetricCardProps) {
  return (
    <div className="soc-card p-4 flex flex-col gap-2 min-w-0 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-xs text-soc-text-dim font-medium">{label}</span>
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${trend.up ? 'text-accent-red' : 'text-accent-green'}`}
          >
            {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-soc-text-bright font-mono tabular-nums animate-count-up">
        {value}
      </div>
      {children}
    </div>
  );
}

export function MetricsBar() {
  const { metrics, sparkline } = useShield();

  const sparkData = sparkline.slice(-20);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <MetricCard
        icon={<Shield className="w-4 h-4" />}
        label="Threats Intercepted"
        value={metrics.totalThreatsIntercepted.toLocaleString()}
        accent="#ff4757"
        trend={{ value: 12, up: true }}
      >
        <div className="flex gap-3 mt-1">
          <span className="text-[10px] font-mono text-accent-red">
            {metrics.blockedCount} blocked
          </span>
          <span className="text-[10px] font-mono text-accent-amber">
            {metrics.quarantinedCount} quarantined
          </span>
        </div>
      </MetricCard>

      <MetricCard
        icon={<AlertTriangle className="w-4 h-4" />}
        label="Active Drift Alerts"
        value={metrics.activeDriftAlerts}
        accent="#f5a623"
        trend={{ value: 8, up: true }}
      >
        <div className="mt-1">
          <Sparkline data={sparkData} width={180} height={32} color="#f5a623" />
        </div>
      </MetricCard>

      <MetricCard
        icon={<ScanLine className="w-4 h-4" />}
        label="Sandbox Scans Today"
        value={metrics.sandboxScansToday.toLocaleString()}
        accent="#00d4ff"
        trend={{ value: 5, up: false }}
      >
        <div className="flex gap-3 mt-1">
          <span className="text-[10px] font-mono text-accent-green">
            {metrics.allowedCount} allowed
          </span>
        </div>
      </MetricCard>

      <MetricCard
        icon={<Activity className="w-4 h-4" />}
        label="Shield Status"
        value={metrics.shieldStatus.toUpperCase()}
        accent="#26de81"
      >
        <div className="flex items-center gap-2 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
          </span>
          <span className="text-[10px] font-mono text-soc-text-dim">
            All subsystems operational
          </span>
        </div>
      </MetricCard>
    </div>
  );
}
