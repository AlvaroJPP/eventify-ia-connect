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
  signUp: (
    email: string,
    password: string,
    fullName: string,
    userType: 'usuario' | 'colaborador'
  ) => Promise<{ data: any; error: any }>;
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
    console.log("🔎 Buscando perfil do usuário:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn("⚠️ Nenhum perfil encontrado para:", userId, error);
      setProfile(null);
      return;
    }
    console.log("✅ Perfil carregado:", data);
    setProfile(data);
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    setProfile(null);
  }
};

useEffect(() => {
  console.log("🚀 Inicializando AuthProvider...");

  const { data } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      console.log("🔄 Estado de auth mudou:", _event, session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }
  );

  supabase.auth.getSession().then(async ({ data: { session } }) => {
    console.log("📦 Sessão inicial carregada:", session);
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      await fetchProfile(session.user.id);
    }
    setLoading(false);
  });

  return () => {
    console.log("🧹 Limpando listener de auth...");
    data.subscription?.unsubscribe();
  };
}, []);

const signUp = async (
  email: string,
  password: string,
  fullName: string,
  userType: 'usuario' | 'colaborador'
) => {
  console.log("📝 Tentando cadastro:", email, fullName, userType);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      },
    },
  });

  if (error) {
    console.error("❌ Erro no cadastro:", error);
    return { data: null, error };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    console.warn("⚠️ E-mail já existente:", email);
    return {
      data: null,
      error: {
        message:
          'Este e-mail já está cadastrado. Verifique sua caixa de entrada para o e-mail de confirmação.',
      },
    };
  }

  if (data.user) {
    console.log("✅ Usuário cadastrado:", data.user);
    return { data, error: null };
  }

  console.error("❌ Erro inesperado no cadastro:", data);
  return {
    data: null,
    error: { message: 'Ocorreu um erro inesperado durante o cadastro.' },
  };
};

const signIn = async (email: string, password: string) => {
  console.log("🔑 Tentando login:", email);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) console.error("❌ Erro no login:", error);
  else console.log("✅ Login bem-sucedido");
  return { error };
};

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
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