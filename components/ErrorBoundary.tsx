import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
                    <div className="mb-6 rounded-full bg-red-900/30 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">The app encountered an unexpected error. We've logged this issue.</p>

                    <div className="w-full max-w-md bg-gray-900 rounded-lg p-4 mb-8 text-left border border-gray-800 overflow-hidden">
                        <p className="text-xs font-mono text-red-400 break-words">
                            {this.state.error?.message || 'Unknown error'}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.clear(); // Clear cache as it might be the cause
                            window.location.reload();
                        }}
                        className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-full transition-colors w-full max-w-xs"
                    >
                        Clear Cache & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
