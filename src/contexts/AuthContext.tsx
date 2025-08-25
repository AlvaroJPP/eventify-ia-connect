// Importa os hooks createContext, useContext, useEffect e useState do React.
import { createContext, useContext, useEffect, useState } from 'react';
// Importa os tipos User e Session do Supabase.
import { User, Session } from '@supabase/supabase-js';
// Importa o cliente Supabase.
import { supabase } from '@/integrations/supabase/client';

// Define a interface para o perfil do usuário.
interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  user_type: 'usuario' | 'colaborador';
}

// Define a interface para o contexto de autenticação.
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

// Cria o contexto de autenticação.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para acessar o contexto de autenticação.
 * @returns O contexto de autenticação.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provedor do contexto de autenticação.
 * @param children - Os componentes filhos que terão acesso ao contexto.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Estados para armazenar os dados do usuário, sessão e perfil.
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Busca o perfil do usuário no banco de dados.
   * @param userId - O ID do usuário.
   */
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

  // Efeito para configurar o listener de estado de autenticação e buscar a sessão existente.
  useEffect(() => {
    // Configura o listener para mudanças no estado de autenticação.
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

    // Verifica se há uma sessão existente.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Remove o listener quando o componente é desmontado.
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Cadastra um novo usuário.
   * @param email - O email do usuário.
   * @param password - A senha do usuário.
   * @param fullName - O nome completo do usuário.
   * @param userType - O tipo de usuário.
   * @returns Um objeto com um possível erro.
   */
    
  const signUp = async (email: string, password: string, fullName: string, userType: 'usuario' | 'colaborador') => {
    // A chamada para supabase.auth.signUp é a única coisa necessária.
    // Ela já verifica se o e-mail existe no sistema de autenticação.
    // Os metadados em 'options.data' serão usados pelo seu gatilho no banco de dados.
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

    // Se o Supabase retornar um erro (incluindo usuário já existente),
    // nós o repassamos para a interface do usuário.
    if (error) {
      console.error('Erro no signUp do Supabase:', error);
      // Você pode customizar a mensagem se quiser, mas a verificação é feita pelo Supabase.
      return { error: { message: 'Não foi possível realizar o cadastro. O e-mail pode já estar em uso.' } };
    }

    // Retorna o resultado da operação.
    return { data, error };
  };


  /**
   * Faz o login do usuário.
   * @param email - O email do usuário.
   * @param password - A senha do usuário.
   * @returns Um objeto com um possível erro.
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  /**
   * Faz o login do usuário com o Google.
   * @returns Um objeto com um possível erro.
   */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
    return { error };
  };

  /**
   * Faz o logout do usuário.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Objeto com os valores do contexto.
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

  // Retorna o provedor do contexto com os valores.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};