import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, MessageCircle, Plus, Menu, LogOut, ShoppingCart, Star, CheckCircle, ArrowRight, Sparkles, MapPin, Heart, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CadastroEventos } from "@/components/CadastroEventos";
import { CadastroServicos } from "@/components/CadastroServicos";
import { ListaEventos } from "@/components/ListaEventos";
import { ListaServicos } from "@/components/ListaServicos";
import { ChatInterface } from "@/components/ChatInterface";
import { CarrinhoCompras } from "@/components/CarrinhoCompras";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Componente principal da página inicial
const Index = () => {
  // Obtém informações de autenticação do usuário
  const { user, profile, loading, signOut } = useAuth();
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'home' | 'eventos' | 'servicos' | 'carrinho' | 'chat'>('home');
  // Estado para controlar o menu móvel
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Estado para controlar o modal de cadastro de eventos
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  // Estado para controlar o modal de cadastro de serviços
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

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
  const isLoggedIn = !!user;

  // Função para fazer logout do usuário
  const handleSignOut = async () => {
    await signOut();
  };

  // Renderiza a página principal
  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            {/* Menu móvel e logo */}
            <div className="flex items-center gap-4 md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-4">
                    <h2 className="text-lg font-bold text-primary mb-6">PARÁ-IA</h2>
                    <div className="space-y-2">
                      <Button 
                        variant={activeTab === 'home' ? 'default' : 'ghost'} 
                        onClick={() => {
                          setActiveTab('home');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        Início
                      </Button>
                      <Button 
                        variant={activeTab === 'eventos' ? 'default' : 'ghost'} 
                        onClick={() => {
                          setActiveTab('eventos');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
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
                        className="w-full justify-start"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Serviços
                      </Button>
                      {/* Exibe o botão do carrinho apenas para usuários logados */}
                      {isLoggedIn && profile?.user_type === 'usuario' && (
                        <Button 
                          variant={activeTab === 'carrinho' ? 'default' : 'ghost'} 
                          onClick={() => {
                            setActiveTab('carrinho');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full justify-start"
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
                        className="w-full justify-start"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      
                      {/* Seção de autenticação */}
                      <div className="border-t pt-4 mt-4">
                        {isLoggedIn ? (
                          <>
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
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground mb-4">
                              Entre para acessar todas as funcionalidades
                            </p>
                            <Link to="/auth">
                              <Button className="w-full justify-start">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Entrar / Cadastrar
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-lg font-bold text-primary">PARÁ-IA</h1>
            </div>

            {/* Cabeçalho para desktop */}
            <h1 className="hidden md:block text-2xl font-bold text-primary">PARÁ-IA</h1>

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
              {/* Exibe o botão do carrinho apenas para usuários logados */}
              {isLoggedIn && profile?.user_type === 'usuario' && (
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
              {isLoggedIn ? (
                <>
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
                </>
              ) : (
                <Link to="/auth">
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>

            {/* Botões para dispositivos móveis */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              {isLoggedIn ? (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/auth">
                  <Button size="sm">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Seção da página inicial - Landing Page */}
        {activeTab === 'home' && (
          <div className="space-y-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative px-8 py-24 md:py-32 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Orgulhosamente paraense</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  Conecte-se com o
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Pará Digital
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 leading-relaxed">
                  A plataforma que une tradição e inovação. Encontre eventos únicos, 
                  contrate serviços locais e converse com nossa IA inteligente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
                    onClick={() => setActiveTab('eventos')}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explorar Eventos
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-purple-700 font-semibold px-8 py-4 text-lg"
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Conversar com IA
                  </Button>
                </div>
              </div>
            </section>

            {/* Seção de Estatísticas */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">100+</div>
                <div className="text-muted-foreground">Eventos Cadastrados</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
                <div className="text-muted-foreground">Serviços Disponíveis</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
                <div className="text-muted-foreground">Assistente IA</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-1">
                  <Heart className="w-6 h-6 text-red-500" />
                  PA
                </div>
                <div className="text-muted-foreground">Feito no Pará</div>
              </div>
            </section>

            {/* Seção de Funcionalidades Principais */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Tudo que você precisa em um só lugar
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Uma plataforma completa que conecta pessoas, eventos e serviços 
                  com a inovação da inteligência artificial.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Gestão de Eventos</CardTitle>
                    <CardDescription className="text-base">
                      {canCreateContent 
                        ? "Cadastre e organize seus eventos com todas as informações necessárias"
                        : "Descubra eventos incríveis acontecendo no Pará"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      className="group/btn"
                      onClick={() => setActiveTab('eventos')}
                    >
                      Ver Eventos
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Catálogo de Serviços</CardTitle>
                    <CardDescription className="text-base">
                      {canCreateContent 
                        ? "Cadastre seus serviços e conecte-se com potenciais clientes"
                        : "Encontre e contrate serviços de qualidade com facilidade"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      className="group/btn"
                      onClick={() => setActiveTab('servicos')}
                    >
                      Ver Serviços
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Assistente Inteligente</CardTitle>
                    <CardDescription className="text-base">
                      Converse com nossa IA avançada para obter informações personalizadas sobre eventos e serviços
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      className="group/btn"
                      onClick={() => setActiveTab('chat')}
                    >
                      Iniciar Chat
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Seção de Benefícios */}
            <section className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Por que escolher o PARÁ-IA?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Desenvolvido especialmente para atender as necessidades da comunidade paraense, 
                    combinando tradição local com tecnologia de ponta.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Interface Intuitiva</h3>
                        <p className="text-muted-foreground">Fácil de usar, pensada para todos os perfis de usuários</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">IA Personalizada</h3>
                        <p className="text-muted-foreground">Assistente inteligente treinado para o contexto paraense</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Comunidade Local</h3>
                        <p className="text-muted-foreground">Conecte-se com eventos e serviços da sua região</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Sempre Atualizado</h3>
                        <p className="text-muted-foreground">Informações em tempo real sobre eventos e serviços</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Tecnologia Avançada</h3>
                    <p className="text-lg opacity-90">
                      Inteligência Artificial integrada para uma experiência única e personalizada
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action Final */}
            <section className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para começar sua jornada?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Junte-se à comunidade que está transformando o Pará através da tecnologia
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-8 py-4"
                  onClick={() => setActiveTab('eventos')}
                >
                  Começar Agora
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-purple-700 font-semibold px-8 py-4"
                  onClick={() => setActiveTab('chat')}
                >
                  Falar com IA
                </Button>
              </div>
            </section>
          </div>
        )}

        {/* Seção de eventos */}
        {activeTab === 'eventos' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Eventos</h2>
              <p className="text-muted-foreground">
                Descubra eventos incríveis acontecendo no Pará
              </p>
            </div>

            {/* Botão para cadastrar evento (apenas para colaboradores logados) */}
            {isLoggedIn && canCreateContent && (
              <div className="flex justify-center">
                <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="font-semibold">
                      <Plus className="w-5 h-5 mr-2" />
                      Cadastrar Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Evento</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do evento abaixo
                      </DialogDescription>
                    </DialogHeader>
                    <CadastroEventos />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Lista de eventos melhorada */}
            <ListaEventos />
          </div>
        )}

        {/* Seção de serviços */}
        {activeTab === 'servicos' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Serviços</h2>
              <p className="text-muted-foreground">
                Encontre e contrate serviços de qualidade
              </p>
            </div>

            {/* Botão para cadastrar serviço (apenas para colaboradores logados) */}
            {isLoggedIn && canCreateContent && (
              <div className="flex justify-center">
                <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="font-semibold">
                      <Plus className="w-5 h-5 mr-2" />
                      Cadastrar Novo Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do serviço abaixo
                      </DialogDescription>
                    </DialogHeader>
                    <CadastroServicos />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <ListaServicos />
          </div>
        )}

        {/* Seção do carrinho de compras (apenas para usuários logados) */}
        {activeTab === 'carrinho' && isLoggedIn && (
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
              <p className="text-muted-foreground">
                Converse com nossa IA para obter informações sobre eventos e serviços
              </p>
            </div>
            <ChatInterface />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">PARÁ-IA</h3>
              <p className="text-muted-foreground">
                Conectando pessoas, eventos e serviços no Pará através da inteligência artificial.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Belém, Pará - Brasil</span>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Plataforma</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Eventos</div>
                <div>Serviços</div>
                <div>Chat IA</div>
                <div>Carrinho</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Suporte</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Central de Ajuda</div>
                <div>Contato</div>
                <div>Termos de Uso</div>
                <div>Privacidade</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Tecnologia</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Inteligência Artificial</div>
                <div>Cloud Computing</div>
                <div>Tempo Real</div>
                <div>Segurança</div>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 PARÁ-IA. Desenvolvido com ❤️ no Pará para o Pará.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;