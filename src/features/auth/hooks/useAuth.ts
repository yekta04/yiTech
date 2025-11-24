import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../config/supabase';

type UserRole = 'resident' | 'admin' | 'cleaner' | 'security';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('resident');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session fetch error:', error);
          setSession(null);
          setLoading(false);
          return;
        }
        setSession(session);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserRole(session.user.id);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error('Auth state change subscription error:', err);
      return () => {};
    }
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error.message, error.details);
        setRole('resident');
        return;
      }

      if (profile?.role) {
        setRole(profile.role as UserRole);
      } else {
        console.warn('No profile found for user, using default role');
        setRole('resident');
      }
    } catch (err: any) {
      console.error('Unexpected error fetching role:', err?.message || err);
      setRole('resident');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { data: null, error };
      }
      if (data.user) {
        await fetchUserRole(data.user.id);
      }
      return { data, error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { data: null, error: err as any };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setRole('resident');
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      setRole('resident');
      return { error: err as any };
    }
  };

  return {
    session,
    loading,
    role,
    signInWithEmail,
    signOut,
  };
};
