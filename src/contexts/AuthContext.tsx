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
      // Verificar se o email já existe usando função segura do banco
      const { data: emailExists, error: emailCheckError } = await supabase
        .rpc('check_email_exists', { email_to_check: email.toLowerCase() });

      console.log('Verificando email:', email, 'Existe?', emailExists, 'Error:', emailCheckError);

      if (emailCheckError) {
        console.error('Erro ao verificar email:', emailCheckError);
        return { error: { message: 'Erro ao verificar email no sistema.' } };
      }

      if (emailExists) {
        console.log('Email já existe no sistema, bloqueando cadastro');
        return { error: { message: 'Este e-mail já está cadastrado no sistema.' } };
      }

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

      console.log('Resultado do signUp:', { data, error });

      // Se o Supabase retornar erro de usuário já existe, retornar mensagem personalizada
      if (error && (error.message.includes('User already registered') || error.message.includes('already been registered'))) {
        return { error: { message: 'Este e-mail já está cadastrado no sistema.' } };
      }

      // Se retornou dados mas o usuário já existe (signup repetido)
      if (data?.user && !data.user.email_confirmed_at && !error) {
        // Verificar se é um signup repetido comparando com profiles existentes
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle();
        
        if (profileCheck) {
          console.log('Detectado signup repetido');
          return { error: { message: 'Este e-mail já está cadastrado no sistema.' } };
        }
      }

      if (!error) {
        // Update profile with user type after signup
        setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({ user_type: userType, full_name: fullName })
              .eq('user_id', user.id);
          }
        }, 1000);
      }

      return { error };
    } catch (err) {
      console.error('Erro no signUp:', err);
      return { error: { message: 'Erro interno no cadastro.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
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