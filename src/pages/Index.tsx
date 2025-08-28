import { Button } from "@/components/ui/button"; // Componente de botão
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Componentes de cartão
import { Calendar, Users, MessageCircle, Plus, Menu, LogOut, ShoppingCart } from "lucide-react"; // Ícones
import { useState } from "react"; // Hook para gerenciar estado
import { Navigate } from "react-router-dom"; // Componente para redirecionamento
import { useAuth } from "@/contexts/AuthContext"; // Hook para autenticação
import { ThemeToggle } from "@/components/ui/theme-toggle"; // Botão de troca de tema
import { CadastroEventos } from "@/components/CadastroEventos"; // Componente de cadastro de eventos
import { CadastroServicos } from "@/components/CadastroServicos"; // Componente de cadastro de serviços
import { ListaEventos } from "@/components/ListaEventos"; // Componente de listagem de eventos
import { ListaServicos } from "@/components/ListaServicos"; // Componente de listagem de serviços
import { ChatInterface } from "@/components/ChatInterface"; // Componente de chat
import { CarrinhoCompras } from "@/components/CarrinhoCompras"; // Componente do carrinho de compras
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Componente de menu lateral

// Componente principal da página inicial
const Index = () => {
  // Obtém informações de autenticação do usuário
  const { user, profile, loading, signOut } = useAuth();
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'home' | 'eventos' | 'servicos' | 'carrinho' | 'chat'>('home');
  // Estado para controlar o menu móvel
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redireciona para a página de autenticação se o usuário não estiver logado
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Exibe uma mensagem de carregamento enquanto os dados do usuário são carregados
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

  // Verifica se o usuário é um colaborador para permitir a criação de conteúdo
  const canCreateContent = profile?.user_type === 'colaborador';

  // Função para fazer logout do usuário
  const handleSignOut = async () => {
    await signOut();
  };

  // Renderiza a página principal
  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Menu para dispositivos móveis */}
            <div className="flex items-center gap-4 md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col gap-4 mt-8">
                    {/* Botões do menu móvel */}
                    <Button 
                      variant={activeTab === 'home' ? 'default' : 'ghost'} 
                      onClick={() => {
                        setActiveTab('home');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Início
                    </Button>
                    <Button 
                      variant={activeTab === 'eventos' ? 'default' : 'ghost'} 
                      onClick={() => {
                        setActiveTab('eventos');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Eventos
                    </Button>
                    <Button 
                      variant={activeTab === 'servicos' ? 'default' : 'ghost'} 
                      onClick={() => {
                        setActiveTab('servicos');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Serviços
                    </Button>
                    {/* Exibe o botão do carrinho apenas para usuários */}
                    {profile?.user_type === 'usuario' && (
                      <Button 
                        variant={activeTab === 'carrinho' ? 'default' : 'ghost'} 
                        onClick={() => {
                          setActiveTab('carrinho');
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Carrinho
                      </Button>
                    )}
                    <Button 
                      variant={activeTab === 'chat' ? 'default' : 'ghost'} 
                      onClick={() => {
                        setActiveTab('chat');
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    {/* Informações do usuário e botão de sair */}
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Olá, {profile?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Tipo: {profile?.user_type === 'colaborador' ? 'Colaborador' : 'Usuário'}
                      </p>
                      <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-lg font-bold text-primary">COP30 Hub Belém</h1>
            </div>

            {/* Cabeçalho para desktop */}
            <h1 className="hidden md:block text-2xl font-bold text-primary">COP30 Hub Belém</h1>

            {/* Menu para desktop */}
            <div className="hidden md:flex gap-4">
              <Button 
                variant={activeTab === 'home' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('home')}
              >
                Início
              </Button>
              <Button 
                variant={activeTab === 'eventos' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('eventos')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Eventos
              </Button>
              <Button 
                variant={activeTab === 'servicos' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('servicos')}
              >
                <Users className="w-4 h-4 mr-2" />
                Serviços
              </Button>
              {/* Exibe o botão do carrinho apenas para usuários */}
              {profile?.user_type === 'usuario' && (
                <Button 
                  variant={activeTab === 'carrinho' ? 'default' : 'ghost'} 
                  onClick={() => setActiveTab('carrinho')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrinho
                </Button>
              )}
              <Button 
                variant={activeTab === 'chat' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('chat')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>

            {/* Menu do usuário para desktop */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.user_type === 'colaborador' ? 'Colaborador' : 'Usuário'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Botão de usuário para dispositivos móveis */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Seção da página inicial */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Seção de destaque */}
            <section className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-foreground">
                Organize seus Eventos e Serviços
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Plataforma completa para cadastro e gerenciamento de eventos e serviços. 
                Cadastre, organize e encontre tudo em um só lugar.
              </p>
              <div className="flex gap-4 justify-center">
                {/* Botões de ação para colaboradores */}
                {canCreateContent && (
                  <Button size="lg" onClick={() => setActiveTab('eventos')}>
                    <Plus className="w-5 h-5 mr-2" />
                    Cadastrar Evento
                  </Button>
                )}
                {canCreateContent && (
                  <Button size="lg" variant="outline" onClick={() => setActiveTab('servicos')}>
                    <Plus className="w-5 h-5 mr-2" />
                    Cadastrar Serviço
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => setActiveTab('servicos')}>
                  <Users className="w-5 h-5 mr-2" />
                  Ver Serviços
                </Button>
              </div>
            </section>

            {/* Seção de funcionalidades */}
            <section className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Calendar className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Gestão de Eventos</CardTitle>
                  <CardDescription>
                    {canCreateContent 
                      ? "Cadastre e organize seus eventos com todas as informações necessárias"
                      : "Explore eventos disponíveis e encontre oportunidades interessantes"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab('eventos')}>
                    Ver Eventos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Catálogo de Serviços</CardTitle>
                  <CardDescription>
                    {canCreateContent 
                      ? "Cadastre seus serviços e conecte-se com potenciais clientes"
                      : "Encontre e contrate serviços de qualidade com facilidade"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab('servicos')}>
                    Ver Serviços
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MessageCircle className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Assistente Inteligente</CardTitle>
                  <CardDescription>
                    Converse com nossa IA para obter informações sobre eventos e serviços
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab('chat')}>
                    Iniciar Chat
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Seção de eventos */}
        {activeTab === 'eventos' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Eventos</h2>
              <p className="text-muted-foreground">
                {canCreateContent 
                  ? "Cadastre novos eventos ou visualize os existentes"
                  : "Explore eventos disponíveis"
                }
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {canCreateContent && <CadastroEventos />}
              <ListaEventos />
            </div>
          </div>
        )}

        {/* Seção de serviços */}
        {activeTab === 'servicos' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Serviços</h2>
              <p className="text-muted-foreground">
                {canCreateContent 
                  ? "Cadastre novos serviços ou visualize os existentes"
                  : "Explore serviços disponíveis para contratação"
                }
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {canCreateContent && <CadastroServicos />}
              <ListaServicos />
            </div>
          </div>
        )}

        {/* Seção do carrinho de compras */}
        {activeTab === 'carrinho' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Carrinho de Compras</h2>
              <p className="text-muted-foreground">Gerencie seus serviços contratados</p>
            </div>
            <CarrinhoCompras />
          </div>
        )}

        {/* Seção do chat */}
        {activeTab === 'chat' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Assistente Inteligente</h2>
              <p className="text-muted-foreground">Converse sobre eventos e serviços cadastrados</p>
            </div>
            <ChatInterface />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;