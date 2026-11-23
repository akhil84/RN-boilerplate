import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportError } from './errors';

export type ErrorFallbackProps = { error: Error; reset: () => void };

type Props = {
  children: ReactNode;
  /** UI shown after a render error. Supplied by the app so this package stays UI-free. */
  fallback: (props: ErrorFallbackProps) => ReactNode;
};

type State = { error: Error | null };

/** Catches render errors below it, reports them, and shows `fallback` with a reset action. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { componentStack: info.componentStack });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) return this.props.fallback({ error, reset: this.reset });
    return this.props.children;
  }
}
