'use client';

/**
 * @file ErrorBoundary.js
 * @description React Error Boundary component for graceful error handling
 */

import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 * 
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Update state when an error is caught
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Component stack trace
   */
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Here you could send error to logging service
    // logErrorToService(error, errorInfo);
  }

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                エラーが発生しました
              </h1>

              {/* Error Message */}
              <p className="text-foreground-light mb-6">
                申し訳ございません。予期しないエラーが発生しました。
                <br />
                ページを再読み込みしてください。
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-foreground-light hover:text-foreground mb-2">
                    エラー詳細を表示
                  </summary>
                  <div className="bg-surface-100 border border-border rounded p-4 text-xs font-mono overflow-auto max-h-40">
                    <pre className="text-destructive whitespace-pre-wrap break-all">
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="default"
                  onClick={this.handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  再試行
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  ダッシュボードに戻る
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for error boundary with custom fallback
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {React.ReactNode} props.fallback - Custom fallback UI
 * @returns {JSX.Element}
 */
export function ErrorBoundaryWithFallback({ children, fallback }) {
  if (fallback) {
    return (
      <ErrorBoundary fallbackRender={fallback}>
        {children}
      </ErrorBoundary>
    );
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default ErrorBoundary;
