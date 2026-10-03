import { Component, type ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Shield ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-soc-bg p-4">
          <div className="soc-card max-w-md w-full p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-red/15 mb-4">
              <ShieldAlert className="w-8 h-8 text-accent-red" />
            </div>
            <h2 className="text-xl font-semibold text-soc-text-bright mb-2">
              Shield Subsystem Error
            </h2>
            <p className="text-soc-text-dim text-sm mb-1">
              An unexpected error was intercepted by the error boundary.
            </p>
            <p className="text-accent-red/80 text-xs font-mono mb-6 break-words">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25 transition-colors font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Shield
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
