import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ThreatEvent,
  QuarantinedItem,
  ShieldMetrics,
  SparklinePoint,
  DriftHistoryPoint,
  StreamConfig,
  SandboxResult,
} from '@/types';
import { storage } from '@/lib/storage';
import { generateThreatEvent, generateBurst } from '@/lib/eventStream';

const DEFAULT_METRICS: ShieldMetrics = {
  totalThreatsIntercepted: 0,
  activeDriftAlerts: 0,
  sandboxScansToday: 0,
  shieldStatus: 'active',
  uptime: 0,
  blockedCount: 0,
  quarantinedCount: 0,
  allowedCount: 0,
};

const DEFAULT_STREAM_CONFIG: StreamConfig = {
  speed: 3000,
  paused: false,
  sensitivity: 50,
};

const MAX_SPARKLINE_POINTS = 60;

interface ShieldContextValue {
  events: ThreatEvent[];
  quarantined: QuarantinedItem[];
  metrics: ShieldMetrics;
  sparkline: SparklinePoint[];
  driftHistory: DriftHistoryPoint[];
  streamConfig: StreamConfig;
  lastSandboxResult: SandboxResult | null;
  addEvent: (event: ThreatEvent) => void;
  addQuarantined: (item: QuarantinedItem) => void;
  releaseQuarantined: (id: string) => void;
  dismissQuarantined: (id: string) => void;
  clearEvents: () => void;
  setStreamConfig: (config: Partial<StreamConfig>) => void;
  setLastSandboxResult: (result: SandboxResult | null) => void;
  addDriftHistoryPoint: (point: DriftHistoryPoint) => void;
  resetShield: () => void;
}

const ShieldContext = createContext<ShieldContextValue | null>(null);

export function ShieldProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ThreatEvent[]>(() => {
    const stored = storage.getEvents<ThreatEvent>();
    if (stored.length > 0) return stored;
    return generateBurst(40);
  });
  const [quarantined, setQuarantined] = useState<QuarantinedItem[]>(() =>
    storage.getQuarantined<QuarantinedItem>()
  );
  const [metrics, setMetrics] = useState<ShieldMetrics>(() => {
    const stored = storage.getMetrics<ShieldMetrics>();
    if (stored) return stored;
    const initial = { ...DEFAULT_METRICS, totalThreatsIntercepted: 0 };
    return initial;
  });
  const [sparkline, setSparkline] = useState<SparklinePoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 40 }, (_, i) => ({
      t: now - (40 - i) * 3000,
      value: Math.floor(Math.random() * 5) + 1,
    }));
  });
  const [driftHistory, setDriftHistory] = useState<DriftHistoryPoint[]>(() =>
    storage.getDriftHistory<DriftHistoryPoint>()
  );
  const [streamConfig, setStreamConfigState] = useState<StreamConfig>(() => {
    const stored = storage.getStreamConfig<StreamConfig>();
    if (stored) return { ...DEFAULT_STREAM_CONFIG, ...stored };
    return DEFAULT_STREAM_CONFIG;
  });
  const [lastSandboxResult, setLastSandboxResult] =
    useState<SandboxResult | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const addEvent = useCallback((event: ThreatEvent) => {
    setEvents((prev) => {
  const updated = [event, ...prev].slice(0, 500);
  storage.setEvents(updated);
  return updated;
});
  }, []);

  const addQuarantined = useCallback((item: QuarantinedItem) => {
    setQuarantined((prev) => {
      const updated = [item, ...prev].slice(0, 200);
      storage.setQuarantined(updated);
      return updated;
    });
  }, []);

  const releaseQuarantined = useCallback((id: string) => {
    setQuarantined((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, released: true } : item
      );
      storage.setQuarantined(updated);
      return updated;
    });
  }, []);

  const dismissQuarantined = useCallback((id: string) => {
    setQuarantined((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.setQuarantined(updated);
      return updated;
    });
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    storage.setEvents([]);
  }, []);

  const setStreamConfig = useCallback((config: Partial<StreamConfig>) => {
    setStreamConfigState((prev) => {
      const updated = { ...prev, ...config };
      storage.setStreamConfig(updated);
      return updated;
    });
  }, []);

  const addDriftHistoryPoint = useCallback((point: DriftHistoryPoint) => {
    setDriftHistory((prev) => {
      const updated = [...prev, point].slice(-120);
      storage.setDriftHistory(updated);
      return updated;
    });
  }, []);

  const resetShield = useCallback(() => {
    storage.clearAll();
    setEvents([]);
    setQuarantined([]);
    setMetrics({ ...DEFAULT_METRICS });
    setSparkline([]);
    setDriftHistory([]);
    setLastSandboxResult(null);
    setStreamConfigState(DEFAULT_STREAM_CONFIG);
    startTimeRef.current = Date.now();
  }, []);

  // Live event stream
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamConfig.paused) return;

    intervalRef.current = setInterval(() => {
      const event = generateThreatEvent();
      setEvents((prev) => {
        const updated = [event, ...prev].slice(0, 500);
        storage.setEvents(updated);
        return updated;
      });

      setSparkline((prev) => {
        const now = Date.now();
        const updated = [...prev, { t: now, value: 1 }].slice(-MAX_SPARKLINE_POINTS);
        return updated;
      });

      if (event.threatScore >= 35) {
        setMetrics((prev) => ({
          ...prev,
          totalThreatsIntercepted: prev.totalThreatsIntercepted + 1,
          activeDriftAlerts:
            event.type === 'drift'
              ? prev.activeDriftAlerts + 1
              : prev.activeDriftAlerts,
          blockedCount:
            event.status === 'blocked'
              ? prev.blockedCount + 1
              : prev.blockedCount,
          quarantinedCount:
            event.status === 'quarantined'
              ? prev.quarantinedCount + 1
              : prev.quarantinedCount,
          allowedCount:
            event.status === 'allowed'
              ? prev.allowedCount + 1
              : prev.allowedCount,
        }));
      }
    }, streamConfig.speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [streamConfig.speed, streamConfig.paused]);

  // Update metrics from events on initial load
  useEffect(() => {
    if (events.length === 0) return;
    const blocked = events.filter((e) => e.status === 'blocked').length;
    const quarantinedCount = events.filter(
      (e) => e.status === 'quarantined'
    ).length;
    const allowed = events.filter((e) => e.status === 'allowed').length;
    const driftAlerts = events.filter(
      (e) => e.type === 'drift' && e.threatScore >= 35
    ).length;

    setMetrics((prev) => {
      const updated: ShieldMetrics = {
        ...prev,
        totalThreatsIntercepted: blocked + quarantinedCount,
        activeDriftAlerts: driftAlerts,
        blockedCount: blocked,
        quarantinedCount,
        allowedCount: allowed,
        sandboxScansToday: events.filter((e) => e.type === 'sandbox').length,
      };
      storage.setMetrics(updated);
      return updated;
    });
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Uptime ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ShieldContext.Provider
      value={{
        events,
        quarantined,
        metrics,
        sparkline,
        driftHistory,
        streamConfig,
        lastSandboxResult,
        addEvent,
        addQuarantined,
        releaseQuarantined,
        dismissQuarantined,
        clearEvents,
        setStreamConfig,
        setLastSandboxResult,
        addDriftHistoryPoint,
        resetShield,
      }}
    >
      {children}
    </ShieldContext.Provider>
  );
}

export function useShield(): ShieldContextValue {
  const ctx = useContext(ShieldContext);
  if (!ctx) throw new Error('useShield must be used within ShieldProvider');
  return ctx;
}
