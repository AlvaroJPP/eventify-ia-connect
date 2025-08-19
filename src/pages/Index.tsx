import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MessageCircle, Plus, Menu, LogOut, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CadastroEventos } from "@/components/CadastroEventos";
import { CadastroServicos } from "@/components/CadastroServicos";
import { ListaEventos } from "@/components/ListaEventos";
import { ListaServicos } from "@/components/ListaServicos";
import { ChatInterface } from "@/components/ChatInterface";
import { CarrinhoCompras } from "@/components/CarrinhoCompras";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'eventos' | 'servicos' | 'carrinho' | 'chat'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

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

  const canCreateContent = profile?.user_type === 'colaborador';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Mobile Menu */}
            <div className="flex items-center gap-4 md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col gap-4 mt-8">
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

            {/* Desktop Header */}
            <h1 className="hidden md:block text-2xl font-bold text-primary">COP30 Hub Belém</h1>

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

            {/* User Menu - Desktop */}
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

            {/* Mobile User Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-foreground">
                Organize seus Eventos e Serviços
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Plataforma completa para cadastro e gerenciamento de eventos e serviços. 
                Cadastre, organize e encontre tudo em um só lugar.
              </p>
              <div className="flex gap-4 justify-center">
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

            {/* Features */}
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

        {activeTab === 'carrinho' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Carrinho de Compras</h2>
              <p className="text-muted-foreground">Gerencie seus serviços contratados</p>
            </div>
            <CarrinhoCompras />
          </div>
        )}

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