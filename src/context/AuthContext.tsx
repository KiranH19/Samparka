import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'samparka_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            // Fetch profile
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            if (prof) {
              setProfile(prof as Profile);
            }
          }
        } catch (err) {
          console.warn('Supabase session load error:', err);
        }
      } else {
        // Only load user if they previously legitimately registered or logged in
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Purge old mock evaluation test accounts
            if (parsed.user?.id === 'usr-student-1' || parsed.user?.id === 'owner-1' || parsed.user?.id === 'admin-super-1') {
              localStorage.removeItem(LOCAL_AUTH_KEY);
              setUser(null);
              setProfile(null);
            } else {
              setUser(parsed.user);
              setProfile(parsed.profile);
            }
          } catch {
            setUser(null);
            setProfile(null);
          }
        } else {
          // Clean public start: Unauthenticated visitor / guest
          setUser(null);
          setProfile(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (prof) setProfile(prof as Profile);
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured() && password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        setIsLoading(false);
        return {};
      } catch (err: any) {
        setIsLoading(false);
        return { error: err.message || 'Login failed' };
      }
    }

    // Local authentication fallback for instant demo testing
    const role: UserRole = email.includes('employer') || email.includes('kamat') ? 'employer' :
                           email.includes('admin') ? 'admin' : 'job_seeker';
    const isAdm = role === 'admin';
    const newUser: User = { id: `usr-${Date.now()}`, email };
    const newProf: Profile = {
      id: newUser.id,
      full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      user_type: role,
      city: 'Hubli',
      locality: 'Vidyanagar',
      skills: ['Communication', 'Local Routes', 'Kannada'],
      is_admin: isAdm,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(newUser);
    setProfile(newProf);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: newUser, profile: newProf }));
    setIsLoading(false);
    return {};
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              user_type: role,
              is_admin: false,
            },
          },
        });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || email });
        }
        setIsLoading(false);
        return {};
      } catch (err: any) {
        setIsLoading(false);
        return { error: err.message || 'Signup failed' };
      }
    }

    // Local fallback
    const newUser: User = { id: `usr-${Date.now()}`, email };
    const newProf: Profile = {
      id: newUser.id,
      full_name: fullName,
      user_type: role,
      city: 'Hubli',
      locality: 'Chennamma Circle',
      skills: [],
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(newUser);
    setProfile(newProf);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: newUser, profile: newProf }));
    setIsLoading(false);
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    if (!user || !profile) return { error: 'Not authenticated' };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (error) return { error: error.message };
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user, profile: updated }));
    return {};
  };

  const role = profile?.user_type || null;
  const isAdmin = profile?.is_admin || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
