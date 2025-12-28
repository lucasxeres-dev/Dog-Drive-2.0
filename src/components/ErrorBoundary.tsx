import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, Sparkles } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State;
    public props: Props;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-[4rem] animate-pulse"></div>
                            <div className="relative size-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mx-auto border border-red-50 text-red-500">
                                <AlertCircle size={64} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles size={16} className="text-red-400" />
                            <span className="text-[12px] font-black uppercase tracking-[0.3em] text-red-400">Sistema Interrompido</span>
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                            Ops! Algo não saiu <br />
                            <span className="text-red-500">como esperado.</span>
                        </h2>

                        <p className="text-slate-500 font-bold leading-relaxed mb-10 px-4">
                            Encontramos um problema técnico. Nossa equipe já está trabalhando para resolver isso o mais rápido possível.
                        </p>

                        <div className="space-y-4 px-6">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
                            >
                                <Home size={20} />
                                Voltar ao Início
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full h-16 bg-white text-slate-400 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 active:scale-95 transition-all"
                            >
                                <RefreshCcw size={20} />
                                Tentar Novamente
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-12 text-left bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Debug Info</p>
                                <pre className="text-[10px] text-slate-400 font-mono overflow-auto max-h-32 no-scrollbar leading-relaxed">
                                    {this.state.error.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
