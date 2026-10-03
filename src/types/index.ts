export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EventType = 'injection' | 'drift' | 'sandbox' | 'system';
export type ThreatStatus = 'blocked' | 'quarantined' | 'allowed' | 'analyzing';

export interface ThreatEvent {
  id: string;
  timestamp: number;
  type: EventType;
  severity: Severity;
  status: ThreatStatus;
  source: string;
  threatScore: number;
  description: string;
  details: string;
  flaggedPhrases: string[];
  techniqueBreakdown: TechniqueScore[];
  inputText?: string;
  driftVector?: DriftVector;
}

export interface TechniqueScore {
  technique: string;
  score: number;
  matched: boolean;
  patterns: string[];
}

export interface DriftVector {
  intent: number;
  instructionOverride: number;
  dataExtraction: number;
  roleHijack: number;
  encodingEvasion: number;
  overall: number;
}

export interface SandboxResult {
  inputText: string;
  threatScore: number;
  verdict: 'block' | 'quarantine' | 'allow';
  driftVector: DriftVector;
  techniqueBreakdown: TechniqueScore[];
  flaggedPhrases: string[];
  analysisTime: number;
  timestamp: number;
}

export interface QuarantinedItem {
  id: string;
  inputText: string;
  threatScore: number;
  techniqueBreakdown: TechniqueScore[];
  flaggedPhrases: string[];
  quarantinedAt: number;
  released: boolean;
}

export interface ShieldMetrics {
  totalThreatsIntercepted: number;
  activeDriftAlerts: number;
  sandboxScansToday: number;
  shieldStatus: 'active' | 'standby' | 'monitoring';
  uptime: number;
  blockedCount: number;
  quarantinedCount: number;
  allowedCount: number;
}

export interface SparklinePoint {
  t: number;
  value: number;
}

export interface DriftHistoryPoint {
  t: number;
  overall: number;
  intent: number;
  instructionOverride: number;
  dataExtraction: number;
  roleHijack: number;
  encodingEvasion: number;
}

export interface InjectionPattern {
  technique: string;
  patterns: RegExp[];
  description: string;
  severity: Severity;
  baseScore: number;
}

export interface FilterState {
  severity: Severity | 'all';
  eventType: EventType | 'all';
  status: ThreatStatus | 'all';
  search: string;
  timeRange: '1min' | '5min' | '1hour' | 'all';
}

export interface StreamConfig {
  speed: number;
  paused: boolean;
  sensitivity: number;
}
