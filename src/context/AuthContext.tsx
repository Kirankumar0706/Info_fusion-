import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Profile, Organization } from '../types';
import { organizationService } from '../services/organizations';

interface SignUpData {
  fullName: string;
  organizationName: string;
  role: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  authError: string | null;
  setCurrentOrganization: (org: Organization | null) => void;
  createOrganization: (name: string) => Promise<Organization>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, data: SignUpData) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  demoSignIn: (role?: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_PROFILE_KEY = 'infofusion_auth_profile_v3';
const LOCAL_ACTIVE_ORG_KEY = 'infofusion_active_org_id_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr-default',
      full_name: 'Lead Evaluator',
      email: 'evaluator@enterprise.org',
      organization: 'Enterprise Organization',
      role: 'Intelligence & Compliance Lead',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
    };
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);

  // Sync profile locally
  useEffect(() => {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Load organizations on start
  const refreshOrganizations = async (userId?: string) => {
    try {
      const orgs = await organizationService.getOrganizations();
      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem(LOCAL_ACTIVE_ORG_KEY);
      const matched = orgs.find(o => o.id === savedOrgId) || orgs[0] || null;
      setCurrentOrganizationState(matched);
    } catch (err) {
      console.warn('Failed to load organizations:', err);
    }
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      refreshOrganizations();
      return;
    }

    // Check existing active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        const metadata = currentSession.user.user_metadata || {};
        setProfile(prev => ({
          ...prev,
          id: currentSession.user.id,
          email: currentSession.user.email || prev.email,
          full_name: metadata.full_name || prev.full_name,
          organization: metadata.organization_name || prev.organization,
          role: metadata.role || prev.role,
        }));
      }
      setIsLoading(false);
      refreshOrganizations(currentSession?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const metadata = newSession.user.user_metadata || {};
        setProfile(prev => ({
          ...prev,
          id: newSession.user.id,
          email: newSession.user.email || prev.email,
          full_name: metadata.full_name || prev.full_name,
          organization: metadata.organization_name || prev.organization,
          role: metadata.role || prev.role,
        }));
      }
      refreshOrganizations(newSession?.user?.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganizationState(org);
    if (org) {
      localStorage.setItem(LOCAL_ACTIVE_ORG_KEY, org.id);
    } else {
      localStorage.removeItem(LOCAL_ACTIVE_ORG_KEY);
    }
  };

  const createOrganization = async (name: string): Promise<Organization> => {
    const org = await organizationService.createOrganization(name, user?.id || profile.id);
    setOrganizations(prev => [org, ...prev]);
    setCurrentOrganization(org);
    setProfile(prev => ({ ...prev, organization: org.name }));
    return org;
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setIsLoading(false);
          // If Supabase returns invalid login credentials or unconfirmed email, return clear error message
          setAuthError(error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          const meta = data.user.user_metadata || {};
          setProfile({
            id: data.user.id,
            email: data.user.email || email,
            full_name: meta.full_name || 'Enterprise Analyst',
            organization: meta.organization_name || 'Enterprise Organization',
            role: meta.role || 'Intelligence Lead',
            preferred_language: 'en',
            created_at: new Date().toISOString(),
          });
          await refreshOrganizations(data.user.id);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    }

    // Fallback offline sign in
    setProfile(prev => ({ ...prev, email }));
    setIsLoading(false);
    return { success: true };
  };

  const signUp = async (
    email: string, 
    password: string, 
    data: SignUpData
  ): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    if (supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: data.fullName.trim(),
              organization_name: data.organizationName.trim(),
              role: data.role.trim(),
            }
          }
        });

        if (error) {
          setIsLoading(false);
          setAuthError(error.message);
          return { success: false, error: error.message };
        }

        const newUser = authData.user;
        const newSession = authData.session;

        // Create organization
        const org = await organizationService.createOrganization(
          data.organizationName.trim(), 
          newUser?.id
        );
        setOrganizations(prev => [org, ...prev]);
        setCurrentOrganization(org);

        // Update profile
        setProfile({
          id: newUser?.id || `usr-${Date.now()}`,
          email,
          full_name: data.fullName.trim(),
          organization: data.organizationName.trim(),
          role: data.role.trim(),
          preferred_language: data.preferredLanguage || 'en',
          created_at: new Date().toISOString(),
        });

        setIsLoading(false);

        // If email confirmation is required and session is null
        if (!newSession && newUser) {
          return { 
            success: true, 
            requiresEmailConfirmation: true 
          };
        }

        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    const org = await organizationService.createOrganization(data.organizationName.trim());
    setOrganizations(prev => [org, ...prev]);
    setCurrentOrganization(org);
    setProfile({
      id: `usr-${Date.now()}`,
      email,
      full_name: data.fullName,
      organization: data.organizationName,
      role: data.role,
      preferred_language: data.preferredLanguage || 'en',
      created_at: new Date().toISOString(),
    });
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem(LOCAL_ACTIVE_ORG_KEY);
    setCurrentOrganizationState(null);
  };

  const demoSignIn = async (role = 'Lead Intelligence Analyst') => {
    setIsLoading(true);
    // Instant demo session
    const demoProfile: Profile = {
      id: 'demo-analyst-uuid',
      full_name: 'Demo Evaluator',
      email: 'evaluator@infofusion.ai',
      organization: 'Apex Global Enterprises',
      role,
      preferred_language: 'en',
      created_at: new Date().toISOString(),
    };
    setProfile(demoProfile);
    const org = await organizationService.createOrganization('Apex Global Enterprises', demoProfile.id);
    setOrganizations([org]);
    setCurrentOrganization(org);
    setIsLoading(false);
  };

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      organizations,
      currentOrganization,
      isLoading,
      authError,
      setCurrentOrganization,
      createOrganization,
      signIn,
      signUp,
      signOut,
      demoSignIn,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
