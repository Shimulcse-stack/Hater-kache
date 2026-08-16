import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
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
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch (e) {
      window.location.href = '/';
    }
  };

  private handleClearAndReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#071325] text-white flex items-center justify-center p-4 select-none">
          <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">
                হাতের কাছে পোর্টালে সাময়িক সমস্যা
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                অ্যাপ্লিকেশনের পেইজ লোড হতে গিয়ে একটি অনিচ্ছাকৃত ত্রুটি ঘটেছে। নিচের বাটনে ক্লিক করে অ্যাপটি পুনরায় রিফ্রেশ করুন।
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] font-mono text-rose-300 text-left max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 px-4 rounded-xl bg-[#ff5e14] hover:bg-[#ea4d05] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>অ্যাপ পুনরায় লোড করুন (Reload)</span>
              </button>

              <button
                onClick={this.handleClearAndReset}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/10"
              >
                <span>ক্যাশ রিসেট ও ফ্রেশ স্টার্ট</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

