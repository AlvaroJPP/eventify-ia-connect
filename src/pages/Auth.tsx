// Importa o hook useState para gerenciar o estado do componente.
import { useState } from 'react';
// Importa o componente Navigate para redirecionar o usuário.
import { Navigate } from 'react-router-dom';
// Importa componentes de UI personalizados.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Importa o hook useAuth para acessar o contexto de autenticação.
import { useAuth } from '@/contexts/AuthContext';
// Importa o hook useToast para exibir notificações.
import { useToast } from '@/hooks/use-toast';

/**
 * Componente de autenticação que lida com o login e cadastro de usuários.
 */
export default function Auth() {
  // Obtém o estado de autenticação e as funções do contexto.
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  // Obtém a função de toast para exibir notificações.
  const { toast } = useToast();
  // Estado para controlar o status de envio do formulário.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireciona para a página inicial se o usuário já estiver autenticado.
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  /**
   * Lida com o envio do formulário de login.
   * @param e - O evento do formulário.
   */
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Tenta fazer o login do usuário.
    const { error } = await signIn(email, password);

    // Exibe uma notificação de erro ou sucesso.
    if (error) {
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      });
    }

    setIsSubmitting(false);
  };

  /**
   * Lida com o envio do formulário de cadastro.
   * @param e - O evento do formulário.
   */
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const userType = formData.get('userType') as 'usuario' | 'colaborador';

    // Tenta cadastrar o usuário.
    const { error } = await signUp(email, password, fullName, userType);

    // Exibe uma notificação de erro ou sucesso.
    if (error) {
      toast({
        title: 'Erro no cadastro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Verifique seu email para confirmar a conta.',
      });
    }

    setIsSubmitting(false);
  };

  /**
   * Lida com o login usando o Google.
   */
  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    
    // Exibe uma notificação de erro, se houver.
    if (error) {
      toast({
        title: 'Erro no login com Google',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Exibe um spinner de carregamento enquanto o estado de autenticação é verificado.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderiza o formulário de autenticação.
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistema de Eventos & Serviços</CardTitle>
          <CardDescription>Entre ou cadastre-se para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                Entrar com Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Nome Completo</Label>
                  <Input
                    id="signup-fullname"
                    name="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Escolha uma senha"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select name="userType" required defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário - Contratar serviços</SelectItem>
                      <SelectItem value="colaborador">Colaborador - Oferecer serviços/eventos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                Cadastrar com Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}