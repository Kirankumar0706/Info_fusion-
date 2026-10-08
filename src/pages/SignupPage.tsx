import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, ArrowRight, ShieldCheck, User, Building2, Globe2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../lib/multilingual';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, demoSignIn, isLoading: authLoading, authError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Intelligence Lead');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requiresEmailConfirm, setRequiresEmailConfirm] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !organization.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await signUp(email, password, {
      fullName: name.trim(),
      organizationName: organization.trim(),
      role: role.trim(),
      preferredLanguage,
    });

    setIsSubmitting(false);

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        setRequiresEmailConfirm(true);
      } else {
        // Starts with zero workspaces in the newly created organization!
        navigate('/workspaces');
      }
    } else {
      setErrorMsg(result.error || 'Registration failed. Please check your details.');
    }
  };

  const handleBypassDemo = async () => {
    setIsSubmitting(true);
    await demoSignIn();
    setIsSubmitting(false);
    navigate('/workspaces');
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
          <p className="text-xs text-slate-400">Initialize your isolated multi-organization workspace</p>
        </div>

        {/* Confirmation Banner if Supabase requires email verification */}
        {requiresEmailConfirm ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-200">Account Created on Supabase!</h4>
                <p className="text-emerald-300/90 mt-1">
                  A verification email has been dispatched to <span className="font-mono font-bold text-white">{email}</span>.
                </p>
              </div>
            </div>
            <button
              onClick={handleBypassDemo}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Launch Instant Enterprise Session Now</span>
            </button>
          </div>
        ) : (
          <>
            {/* Error banner */}
            {(errorMsg || authError) && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <p>{errorMsg || authError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
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
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Organization Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Apex Corp"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role / Function</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Lead Analyst"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Language</label>
                <div className="relative">
                  <Globe2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{isSubmitting || authLoading ? 'Creating Supabase Account...' : 'Initialize Organization'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>

        <div className="text-center pt-2 text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PostgreSQL RLS & Storage Protected</span>
        </div>
      </div>
    </div>
  );
};
