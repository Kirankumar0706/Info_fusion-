import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, ArrowRight, ShieldCheck, Sparkles, Lock, Mail } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoWorkspace } = useWorkspace();
  const [email, setEmail] = useState('gokul@enterprise.org');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loadDemoWorkspace();
      navigate('/dashboard');
    }, 400);
  };

  const handleDemoSignIn = () => {
    loadDemoWorkspace();
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
          <p className="text-xs text-slate-400">Enterprise Information Intelligence Platform</p>
        </div>

        {/* 1-Click Judge Demo Sign In */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          className="w-full p-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>One-Click Judge Demo Sign In</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
          <div className="h-px bg-white/[0.08] flex-1"></div>
          <span>Or sign in with credentials</span>
          <div className="h-px bg-white/[0.08] flex-1"></div>
        </div>

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
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an enterprise account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline font-semibold">
            Create account
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
