import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
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
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                An unexpected error occurred. Please try again or refresh the page.
                            </p>
                        </div>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="text-left text-xs bg-slate-100 p-4 rounded-lg overflow-auto max-h-40 text-rose-700">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
