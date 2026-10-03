import { ThemeProvider } from '@/contexts/ThemeContext';
import { ShieldProvider, useShield } from '@/contexts/ShieldContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TopBar } from '@/components/TopBar';
import { MetricsBar } from '@/components/MetricsBar';
import { DriftDetector } from '@/components/DriftDetector';
import { Sandbox } from '@/components/Sandbox';
import { TelemetryStream } from '@/components/TelemetryStream';

function Dashboard() {
  const { resetShield } = useShield();

  return (
    <ErrorBoundary onReset={resetShield}>
      <div className="min-h-screen bg-soc-bg text-soc-text">
        <TopBar />
        <main className="px-4 lg:px-6 py-4 lg:py-6 space-y-4 lg:space-y-6 max-w-[1800px] mx-auto">
          <MetricsBar />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <DriftDetector />
            <Sandbox />
          </div>
          <TelemetryStream />
        </main>
        <footer className="px-4 lg:px-6 py-4 border-t border-soc-border text-center">
          <p className="text-[10px] font-mono text-soc-text-dim">
            Adversarial Prompt Injection Auto-Shield · Local Agentic Firewall ·
            All analysis performed client-side · No data transmitted
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ShieldProvider>
        <Dashboard />
      </ShieldProvider>
    </ThemeProvider>
  );
}

export default App;
