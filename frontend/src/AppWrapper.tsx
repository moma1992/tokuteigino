import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.error && this.state.error.stack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppWrapper: React.FC = () => {
  try {
    const App = React.lazy(() => import('./App'));
    
    return (
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading App...</div>}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error loading App:', error);
    return (
      <div style={{ padding: '20px' }}>
        <h1>Error loading App</h1>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    );
  }
};