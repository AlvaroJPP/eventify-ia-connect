import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings } from 'lucide-react';

export default function PerfilConfiguracoes() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Seu nome foi atualizado com sucesso.',
      });
      setOpenDialog(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newEmail = formData.get('email') as string;

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      toast({
        title: 'Email atualizado',
        description: 'Verifique seu novo email para confirmar a alteração.',
      });
      setOpenDialog(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
      });
      setOpenDialog(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Perfil
        </CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e configurações de conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label>Nome Completo</Label>
            <p className="text-sm text-muted-foreground">{profile.full_name || 'Não informado'}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <div>
            <Label>Tipo de Usuário</Label>
            <p className="text-sm text-muted-foreground capitalize">{profile.user_type}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Editar Nome */}
          <Dialog open={openDialog === 'name'} onOpenChange={(open) => setOpenDialog(open ? 'name' : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Editar Nome de Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Nome de Usuário</DialogTitle>
                <DialogDescription>
                  Altere seu nome de usuário abaixo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={profile.full_name || ''}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Atualizando...' : 'Atualizar Nome'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Redefinir Email */}
          <Dialog open={openDialog === 'email'} onOpenChange={(open) => setOpenDialog(open ? 'email' : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Redefinir E-mail
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Redefinir E-mail</DialogTitle>
                <DialogDescription>
                  Digite seu novo endereço de email. Você receberá um email de confirmação.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <Label htmlFor="email">Novo Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Atualizando...' : 'Atualizar Email'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Redefinir Senha */}
          <Dialog open={openDialog === 'password'} onOpenChange={(open) => setOpenDialog(open ? 'password' : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Redefinir Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Redefinir Senha</DialogTitle>
                <DialogDescription>
                  Digite sua nova senha abaixo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}