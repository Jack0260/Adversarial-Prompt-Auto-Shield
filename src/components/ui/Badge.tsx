import type { Severity, ThreatStatus, EventType } from '@/types';

const severityStyles: Record<Severity, string> = {
  critical: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  high: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  medium: 'bg-severity-medium/15 text-severity-medium border-severity-medium/30',
  low: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  info: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
};

const statusStyles: Record<ThreatStatus, string> = {
  blocked: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  quarantined: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  allowed: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  analyzing: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
};

const eventTypeStyles: Record<EventType, string> = {
  injection: 'bg-accent-red/10 text-accent-red border-accent-red/25',
  drift: 'bg-accent-amber/10 text-accent-amber border-accent-amber/25',
  sandbox: 'bg-accent-blue/10 text-accent-blue border-accent-blue/25',
  system: 'bg-soc-muted/10 text-soc-muted border-soc-muted/25',
};

const severityLabels: Record<Severity, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  info: 'INFO',
};

const statusLabels: Record<ThreatStatus, string> = {
  blocked: 'BLOCKED',
  quarantined: 'QUARANTINED',
  allowed: 'ALLOWED',
  analyzing: 'ANALYZING',
};

const eventTypeLabels: Record<EventType, string> = {
  injection: 'INJECTION',
  drift: 'DRIFT',
  sandbox: 'SANDBOX',
  system: 'SYSTEM',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${severityStyles[severity]}`}
    >
      {severityLabels[severity]}
    </span>
  );
}

export function StatusBadge({ status }: { status: ThreatStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function EventTypeBadge({ type }: { type: EventType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${eventTypeStyles[type]}`}
    >
      {eventTypeLabels[type]}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? 'text-accent-red'
      : score >= 35
        ? 'text-accent-amber'
        : 'text-accent-green';
  return (
    <span className={`font-mono font-bold text-sm ${color}`}>
      {score}
      <span className="text-soc-text-dim text-xs">/100</span>
    </span>
  );
}
