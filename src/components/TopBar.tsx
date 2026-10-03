import { Moon, Sun, Monitor, Shield, Activity, Pause, Play, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useShield } from '@/contexts/ShieldContext';
import { useState, useRef, useEffect } from 'react';
import type { ThemeMode } from '@/types';

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="inline-flex items-center gap-1 bg-soc-surface border border-soc-border rounded-lg p-1">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            aria-label={`Set theme to ${m.label}`}
            aria-pressed={active}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
              active
                ? 'bg-accent-cyan/15 text-accent-cyan'
                : 'text-soc-text-dim hover:text-soc-text-bright hover:bg-soc-card'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

function StreamControls() {
  const { streamConfig, setStreamConfig } = useShield();
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="inline-flex items-center gap-1 bg-soc-surface border border-soc-border rounded-lg p-1">
        <button
          onClick={() => setStreamConfig({ paused: !streamConfig.paused })}
          aria-label={streamConfig.paused ? 'Resume stream' : 'Pause stream'}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
            streamConfig.paused
              ? 'text-accent-amber hover:bg-accent-amber/15'
              : 'text-accent-green hover:bg-accent-green/15'
          }`}
        >
          {streamConfig.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Stream settings"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-soc-text-dim hover:text-soc-text-bright hover:bg-soc-card transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-64 soc-card p-4 z-50 animate-slide-in-right shadow-xl">
          <h4 className="text-xs font-semibold text-soc-text-bright mb-3">Stream Configuration</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-soc-text-dim flex justify-between mb-1">
                <span>Stream Interval</span>
                <span className="font-mono text-accent-cyan">{(streamConfig.speed / 1000).toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={streamConfig.speed}
                onChange={(e) => setStreamConfig({ speed: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-soc-text-dim flex justify-between mb-1">
                <span>Detection Sensitivity</span>
                <span className="font-mono text-accent-cyan">{streamConfig.sensitivity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={streamConfig.sensitivity}
                onChange={(e) => setStreamConfig({ sensitivity: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const { metrics, streamConfig } = useShield();
  const statusColor =
    metrics.shieldStatus === 'active'
      ? 'text-accent-green'
      : metrics.shieldStatus === 'standby'
        ? 'text-accent-amber'
        : 'text-accent-blue';

  return (
    <header className="sticky top-0 z-40 bg-soc-bg/95 backdrop-blur-md border-b border-soc-border">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-accent-cyan/20 rounded-lg blur-md animate-glow-pulse" />
            <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
              <Shield className="w-5 h-5 text-accent-cyan" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm lg:text-base font-bold text-soc-text-bright tracking-tight truncate">
              Adversarial Prompt Injection Auto-Shield
            </h1>
            <p className="text-[10px] lg:text-xs text-soc-text-dim font-mono hidden sm:block">
              Local Agentic Firewall · SOC Monitoring Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono">
            <Activity className={`w-3.5 h-3.5 ${statusColor} ${!streamConfig.paused ? 'animate-pulse' : ''}`} />
            <span className={statusColor}>SHIELD {metrics.shieldStatus.toUpperCase()}</span>
            <span className="text-soc-text-dim">·</span>
            <span className="text-soc-text-dim">UPTIME {formatUptime(metrics.uptime)}</span>
          </div>
          <StreamControls />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
