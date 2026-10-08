import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, ArrowRight, ShieldCheck, User, Building2, Globe2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { SUPPORTED_LANGUAGES } from '../lib/multilingual';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile, setActiveLanguage, loadDemoWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Procurement & Risk Lead');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: name || 'Enterprise Analyst',
      email: email || 'user@enterprise.org',
      organization: organization || 'Global Enterprise',
      role: role || 'Lead Evaluator',
      preferred_language: preferredLanguage,
    });
    setActiveLanguage(preferredLanguage);
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
          <h2 className="text-2xl font-bold font-display text-white">Create Enterprise Account</h2>
          <p className="text-xs text-slate-400">Initialize your isolated intelligence workspace</p>
        </div>

        {/* Form (Section 4 fields) */}
        <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sundaram"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@enterprise.org"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Organization</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Apex Corp"
                className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Create Profile & Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
