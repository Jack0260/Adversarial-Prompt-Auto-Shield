const STORAGE_KEYS = {
  theme: 'apias-theme',
  events: 'apias-events',
  quarantined: 'apias-quarantined',
  metrics: 'apias-metrics',
  driftHistory: 'apias-drift-history',
  streamConfig: 'apias-stream-config',
};

const MAX_EVENTS = 500;
const MAX_DRIFT_POINTS = 120;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storage = {
  getTheme(): string {
    return safeGet(STORAGE_KEYS.theme, 'dark');
  },
  setTheme(theme: string): void {
    safeSet(STORAGE_KEYS.theme, theme);
  },

  getEvents<T>(): T[] {
    return safeGet<T[]>(STORAGE_KEYS.events, []);
  },
  setEvents<T>(events: T[]): void {
    const trimmed = events.slice(0, MAX_EVENTS);
    safeSet(STORAGE_KEYS.events, trimmed);
  },

  getQuarantined<T>(): T[] {
    return safeGet<T[]>(STORAGE_KEYS.quarantined, []);
  },
  setQuarantined<T>(items: T[]): void {
    safeSet(STORAGE_KEYS.quarantined, items);
  },

  getMetrics<T>(): T | null {
    return safeGet<T | null>(STORAGE_KEYS.metrics, null);
  },
  setMetrics<T>(metrics: T): void {
    safeSet(STORAGE_KEYS.metrics, metrics);
  },

  getDriftHistory<T>(): T[] {
    return safeGet<T[]>(STORAGE_KEYS.driftHistory, []);
  },
  setDriftHistory<T>(points: T[]): void {
    const trimmed = points.slice(-MAX_DRIFT_POINTS);
    safeSet(STORAGE_KEYS.driftHistory, trimmed);
  },

  getStreamConfig<T>(): T | null {
    return safeGet<T | null>(STORAGE_KEYS.streamConfig, null);
  },
  setStreamConfig<T>(config: T): void {
    safeSet(STORAGE_KEYS.streamConfig, config);
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (key !== STORAGE_KEYS.theme) localStorage.removeItem(key);
      });
    } catch {
      // ignore
    }
  },
};
