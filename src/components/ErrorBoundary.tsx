import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public readonly state: State = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        // TODO: Send to error tracking service (Sentry, etc)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
                        </div>
                        <h2 className="text-2xl font-black mb-3 dark:text-white">Algo deu errado</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            Desculpe, encontramos um problema. Nossa equipe foi notificada.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full h-14 bg-primary text-[#050705] rounded-2xl font-black uppercase tracking-wider hover:bg-primary/90 transition-all"
                        >
                            Voltar ao Início
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="text-xs text-gray-500 cursor-pointer">Detalhes do erro</summary>
                                <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
