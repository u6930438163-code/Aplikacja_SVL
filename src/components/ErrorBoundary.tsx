import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 font-mono text-center">
          <div className="p-4 rounded-xl bg-slate-900 border border-rose-800/80 max-w-md space-y-3 shadow-xl">
            <div className="text-rose-400 font-bold text-sm flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>Wystąpił błąd modułu interfejsu</span>
            </div>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'Nieoczekiwany stan renderowania.'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs transition cursor-pointer"
            >
              Uruchom ponownie widok
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
