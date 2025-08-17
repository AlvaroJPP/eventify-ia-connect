import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { CadastroEventos } from "@/components/CadastroEventos";
import { CadastroServicos } from "@/components/CadastroServicos";
import { ListaEventos } from "@/components/ListaEventos";
import { ListaServicos } from "@/components/ListaServicos";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'eventos' | 'servicos' | 'chat'>('home');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Sistema de Eventos & Serviços</h1>
            <div className="flex gap-4">
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
              <Button 
                variant={activeTab === 'chat' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('chat')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
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
                <Button size="lg" onClick={() => setActiveTab('eventos')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Cadastrar Evento
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveTab('servicos')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Cadastrar Serviço
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
                    Cadastre e organize seus eventos com todas as informações necessárias
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
                    Encontre e cadastre serviços com informações detalhadas
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
              <p className="text-muted-foreground">Cadastre novos eventos ou visualize os existentes</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <CadastroEventos />
              <ListaEventos />
            </div>
          </div>
        )}

        {activeTab === 'servicos' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Serviços</h2>
              <p className="text-muted-foreground">Cadastre novos serviços ou visualize os existentes</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <CadastroServicos />
              <ListaServicos />
            </div>
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