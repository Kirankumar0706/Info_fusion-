import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, ArrowRight, ShieldCheck, Sparkles, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, demoSignIn, isLoading: authLoading, authError } = useAuth();
  const { loadGenericTestScenario } = useWorkspace();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error || 'Failed to authenticate. Please check your credentials or use Judge Demo mode.');
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    await demoSignIn();
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-white/[0.1] shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center mx-auto shadow-glow-primary">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Sign In to InfoFusion</h2>
          <p className="text-xs text-slate-400">Enterprise Multi-Organization Intelligence Platform</p>
        </div>

        {/* 1-Click Judge Demo Sign In */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={isSubmitting || authLoading}
          className="w-full p-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>One-Click Judge Demo Sign In</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
          <div className="h-px bg-white/[0.08] flex-1"></div>
          <span>Or sign in with Supabase Auth</span>
          <div className="h-px bg-white/[0.08] flex-1"></div>
        </div>

        {/* Error message */}
        {(errorMsg || authError) && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold">{errorMsg || authError}</p>
              <p className="text-[11px] text-red-400/80 mt-0.5">
                Tip: You can use the One-Click Judge Demo Sign In above, or create a new account.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@enterprise.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-surface-100 border-white/[0.1]" />
              <span>Remember session</span>
            </label>
            <span className="text-indigo-400 hover:underline cursor-pointer">Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting || authLoading ? 'Authenticating with Supabase...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an enterprise account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
            Create organization account
          </Link>
        </div>

        <div className="text-center pt-2 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Supabase Auth & RLS Protected</span>
        </div>
      </div>
    </div>
  );
};
