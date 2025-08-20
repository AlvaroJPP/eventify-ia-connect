import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  user_type: 'usuario' | 'colaborador';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: 'usuario' | 'colaborador') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: 'usuario' | 'colaborador') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      });

      // Handle errors from Supabase
      if (error) {
        if (error.message.includes('already registered') || 
            error.message.includes('email address is already') ||
            error.message.includes('already been registered') ||
            error.message.includes('User already registered')) {
          return { error: { message: 'Este e-mail já está cadastrado no sistema.' } };
        }
        return { error };
      }

      // Additional check: if Supabase returns a user but no confirmation email is sent,
      // it might be because the user already exists
      if (data?.user) {
        // Check if this user already exists in our profiles table
        try {
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();

          if (existingProfile && !profileError) {
            return { error: { message: 'Este e-mail já está cadastrado no sistema.' } };
          }
        } catch (profileCheckError) {
          // If we can't check profiles, continue with signup
          console.log('Could not check existing profiles:', profileCheckError);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: { message: 'Erro interno. Tente novamente.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First check if email exists in profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .limit(1);

      if (profileError) {
        console.error('Error checking profiles:', profileError);
      }

      if (!profiles || profiles.length === 0) {
        return { error: { message: 'Este usuário não existe.' } };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for specific error types
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials') ||
            error.message.includes('Email not confirmed')) {
          return { error: { message: 'Senha incorreta.' } };
        }
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      return { error: { message: 'Erro interno. Tente novamente.' } };
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};