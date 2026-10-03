import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  Activity,
  Search,
  Download,
  Trash2,
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  Filter,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  SeverityBadge,
  StatusBadge,
  EventTypeBadge,
  ScoreBadge,
} from '@/components/ui/Badge';
import { useShield } from '@/contexts/ShieldContext';
import type {
  ThreatEvent,
  FilterState,
  EventType,
  Severity,
  ThreatStatus,
} from '@/types';

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  const ms = d.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 1000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

const DEFAULT_FILTERS: FilterState = {
  severity: 'all',
  eventType: 'all',
  status: 'all',
  search: '',
  timeRange: 'all',
};

function matchesTimeRange(ts: number, range: FilterState['timeRange']): boolean {
  if (range === 'all') return true;
  const now = Date.now();
  const cutoff =
    range === '1min'
      ? 60000
      : range === '5min'
        ? 300000
        : 3600000;
  return now - ts < cutoff;
}

function exportToCSV(events: ThreatEvent[]): void {
  const headers = [
    'Timestamp',
    'Type',
    'Severity',
    'Status',
    'Source',
    'Threat Score',
    'Description',
    'Flagged Phrases',
  ];
  const rows = events.map((e) => [
    new Date(e.timestamp).toISOString(),
    e.type,
    e.severity,
    e.status,
    e.source,
    e.threatScore.toString(),
    `"${e.description.replace(/"/g, '""')}"`,
    `"${e.flaggedPhrases.join('; ').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `threat-telemetry-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const eventTypeIcons: Record<EventType, string> = {
  injection: 'text-accent-red',
  drift: 'text-accent-amber',
  sandbox: 'text-accent-blue',
  system: 'text-soc-muted',
};

function EventRow({ event }: { event: ThreatEvent }) {
  const [expanded, setExpanded] = useState(false);
  const iconColor = eventTypeIcons[event.type];

  return (
    <div className="border-b border-soc-border last:border-b-0 animate-slide-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-soc-surface transition-colors text-left group"
      >
        <span className="shrink-0">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-soc-text-dim" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-soc-text-dim group-hover:text-soc-text" />
          )}
        </span>
        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${event.status === 'blocked' ? 'bg-accent-red' : event.status === 'quarantined' ? 'bg-accent-amber' : event.status === 'allowed' ? 'bg-accent-green' : 'bg-accent-blue'}`} />
        <span className="text-[10px] font-mono text-soc-text-dim shrink-0 w-20 hidden sm:inline">
          {formatTimestamp(event.timestamp)}
        </span>
        <span className="text-[10px] font-mono text-soc-text-dim shrink-0 sm:hidden">
          {timeAgo(event.timestamp)}
        </span>
        <span className={`shrink-0 ${iconColor}`}>
          <Activity className="w-3.5 h-3.5" />
        </span>
        <span className="hidden md:inline shrink-0">
          <EventTypeBadge type={event.type} />
        </span>
        <span className="hidden sm:inline shrink-0">
          <SeverityBadge severity={event.severity} />
        </span>
        <span className="flex-1 min-w-0 text-xs text-soc-text truncate">
          {event.description}
        </span>
        <span className="hidden lg:inline shrink-0 text-[10px] font-mono text-soc-text-dim">
          {event.source}
        </span>
        <span className="shrink-0">
          <ScoreBadge score={event.threatScore} />
        </span>
        <span className="hidden sm:inline shrink-0">
          <StatusBadge status={event.status} />
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-soc-surface/50 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-soc-text-dim">Source: </span>
              <span className="font-mono text-soc-text">{event.source}</span>
            </div>
            <div>
              <span className="text-soc-text-dim">Time: </span>
              <span className="font-mono text-soc-text">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-soc-text-dim">Details: </span>
              <span className="text-soc-text">{event.details}</span>
            </div>
            {event.flaggedPhrases.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-soc-text-dim">Flagged phrases: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.flaggedPhrases.map((p, i) => (
                    <span
                      key={i}
                      className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-red/10 text-accent-red border border-accent-red/20"
                    >
                      "{p}"
                    </span>
                  ))}
                </div>
              </div>
            )}
            {event.techniqueBreakdown.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-soc-text-dim">Techniques: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.techniqueBreakdown.map((t, i) => (
                    <span
                      key={i}
                      className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-soc-surface border border-soc-border text-soc-text"
                    >
                      {t.technique} ({t.score})
                    </span>
                  ))}
                </div>
              </div>
            )}
            {event.driftVector && (
              <div className="sm:col-span-2">
                <span className="text-soc-text-dim">Drift vector: </span>
                <span className="font-mono text-soc-text text-[10px]">
                  intent={event.driftVector.intent} override={event.driftVector.instructionOverride} extract={event.driftVector.dataExtraction} hijack={event.driftVector.roleHijack} encode={event.driftVector.encodingEvasion} overall={event.driftVector.overall}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TelemetryStream() {
  const { events, clearEvents, streamConfig, setStreamConfig } = useShield();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<'timestamp' | 'threatScore'>('timestamp');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => {
      if (filters.severity !== 'all' && e.severity !== filters.severity) return false;
      if (filters.eventType !== 'all' && e.type !== filters.eventType) return false;
      if (filters.status !== 'all' && e.status !== filters.status) return false;
      if (!matchesTimeRange(e.timestamp, filters.timeRange)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          e.description.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.flaggedPhrases.some((p) => p.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'timestamp') {
        cmp = a.timestamp - b.timestamp;
      } else {
        cmp = a.threatScore - b.threatScore;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [events, filters, sortField, sortDir]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.severity !== 'all') count++;
    if (filters.eventType !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.timeRange !== 'all') count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    if (searchRef.current) searchRef.current.value = '';
  }, []);

  // Keyboard shortcut: focus search with '/'
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleSort = (field: 'timestamp' | 'threatScore') => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <Card
      title="Live Threat Telemetry Stream"
      icon={<Activity className="w-4 h-4" />}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-soc-text-dim hidden sm:inline">
            {filteredEvents.length} / {events.length} events
          </span>
          <button
            onClick={() => setStreamConfig({ paused: !streamConfig.paused })}
            aria-label={streamConfig.paused ? 'Resume stream' : 'Pause stream'}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ${
              streamConfig.paused
                ? 'text-accent-amber hover:bg-accent-amber/15'
                : 'text-accent-green hover:bg-accent-green/15'
            }`}
          >
            {streamConfig.paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => exportToCSV(filteredEvents)}
            disabled={filteredEvents.length === 0}
            aria-label="Export filtered events as CSV"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-soc-text-dim hover:text-accent-cyan hover:bg-accent-cyan/15 transition-all duration-200 disabled:opacity-30"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => clearEvents()}
            disabled={events.length === 0}
            aria-label="Clear all events"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-soc-text-dim hover:text-accent-red hover:bg-accent-red/15 transition-all duration-200 disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      }
      scrollable
      className="h-[600px]"
    >
      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-soc-card border-b border-soc-border px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-soc-text-dim" />
            <input
              ref={searchRef}
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search events... (press / to focus)"
              className="w-full bg-soc-surface border border-soc-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-soc-text placeholder:text-soc-text-dim focus:border-accent-cyan/50 transition-colors outline-none"
              aria-label="Search threat events"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              showFilters || activeFilterCount > 0
                ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30'
                : 'bg-soc-surface text-soc-text-dim border-soc-border hover:border-soc-border-hover'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent-cyan/20 text-accent-cyan text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in">
            <Select
              options={[
                { value: 'all', label: 'All Severities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
                { value: 'info', label: 'Info' },
              ]}
              value={filters.severity}
              onChange={(e) => updateFilter('severity', e.target.value as Severity | 'all')}
              className="text-xs py-1"
            />
            <Select
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'injection', label: 'Injection' },
                { value: 'drift', label: 'Drift' },
                { value: 'sandbox', label: 'Sandbox' },
                { value: 'system', label: 'System' },
              ]}
              value={filters.eventType}
              onChange={(e) => updateFilter('eventType', e.target.value as EventType | 'all')}
              className="text-xs py-1"
            />
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'quarantined', label: 'Quarantined' },
                { value: 'allowed', label: 'Allowed' },
                { value: 'analyzing', label: 'Analyzing' },
              ]}
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as ThreatStatus | 'all')}
              className="text-xs py-1"
            />
            <Select
              options={[
                { value: 'all', label: 'All Time' },
                { value: '1min', label: 'Last 1 min' },
                { value: '5min', label: 'Last 5 min' },
                { value: '1hour', label: 'Last 1 hour' },
              ]}
              value={filters.timeRange}
              onChange={(e) => updateFilter('timeRange', e.target.value as FilterState['timeRange'])}
              className="text-xs py-1"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-accent-red hover:bg-accent-red/10 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        )}

        {/* Sort headers */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-soc-text-dim">
          <span className="shrink-0 w-5" />
          <span className="shrink-0 w-1.5" />
          <button
            onClick={() => toggleSort('timestamp')}
            className={`shrink-0 hover:text-soc-text-bright transition-colors ${sortField === 'timestamp' ? 'text-accent-cyan' : ''}`}
          >
            TIME {sortField === 'timestamp' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <span className="flex-1" />
          <button
            onClick={() => toggleSort('threatScore')}
            className={`shrink-0 hover:text-soc-text-bright transition-colors ${sortField === 'threatScore' ? 'text-accent-cyan' : ''}`}
          >
            SCORE {sortField === 'threatScore' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <span className="shrink-0 w-16" />
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto soc-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="w-8 h-8 text-soc-text-dim mb-2" />
            <p className="text-sm text-soc-text-dim">
              {events.length === 0
                ? 'No threat events recorded. The shield is monitoring.'
                : 'No events match the current filters.'}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<X className="w-3 h-3" />}
                onClick={clearFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </Card>
  );
}
