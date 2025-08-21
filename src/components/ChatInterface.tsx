// Importa os hooks useState e useEffect para gerenciar o estado e efeitos colaterais.
import { useState, useEffect } from "react";
// Importa componentes de UI personalizados.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
// Importa o cliente Supabase para interagir com o banco de dados.
import { supabase } from "@/integrations/supabase/client";
// Importa ícones da biblioteca lucide-react.
import { MessageCircle, Send, Bot, User } from "lucide-react";

// Define a interface para uma mensagem do chat.
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

/**
 * Componente que implementa a interface de chat com o assistente inteligente.
 */
export const ChatInterface = () => {
  // Estado para armazenar as mensagens do chat.
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Eu sou seu assistente inteligente. Posso ajudá-lo a encontrar informações sobre eventos e serviços cadastrados. O que você gostaria de saber?',
      timestamp: new Date()
    }
  ]);
  // Estado para armazenar o texto de entrada do usuário.
  const [input, setInput] = useState('');
  // Estado para controlar o status de carregamento.
  const [loading, setLoading] = useState(false);

  /**
   * Processa a consulta do usuário e retorna uma resposta do bot.
   * @param query - A consulta do usuário.
   * @returns A resposta do bot.
   */
  const processUserQuery = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    // Se a consulta for sobre eventos, busca os eventos no banco de dados.
    if (lowerQuery.includes('evento') || lowerQuery.includes('data') || lowerQuery.includes('local')) {
      try {
        const { data: eventos, error } = await supabase
          .from('eventos')
          .select('*')
          .order('data_evento', { ascending: true });

        if (error) throw error;

        if (eventos && eventos.length > 0) {
          let response = `Encontrei ${eventos.length} evento(s) cadastrado(s):\n\n`;
          eventos.slice(0, 3).forEach((evento, index) => {
            response += `${index + 1}. **${evento.nome_evento}**\n`;
            response += `   📅 Data: ${new Date(evento.data_evento).toLocaleDateString('pt-BR')}\n`;
            response += `   📍 Local: ${evento.local_evento}\n`;
            response += `   👤 Responsável: ${evento.responsavel_evento}\n`;
            if (evento.descricao_evento) {
              response += `   📝 Descrição: ${evento.descricao_evento}\n`;
            }
            response += `   📞 Contato: ${evento.contato_evento}\n\n`;
          });
          
          if (eventos.length > 3) {
            response += `E mais ${eventos.length - 3} evento(s)...`;
          }
          
          return response;
        } else {
          return 'Não encontrei nenhum evento cadastrado no momento.';
        }
      } catch (error) {
        return 'Desculpe, ocorreu um erro ao buscar os eventos.';
      }
    }
    
    // Se a consulta for sobre serviços, busca os serviços no banco de dados.
    if (lowerQuery.includes('serviço') || lowerQuery.includes('servico') || lowerQuery.includes('preço') || lowerQuery.includes('preco')) {
      try {
        const { data: servicos, error } = await supabase
          .from('servicos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (servicos && servicos.length > 0) {
          let response = `Encontrei ${servicos.length} serviço(s) cadastrado(s):\n\n`;
          servicos.slice(0, 3).forEach((servico, index) => {
            response += `${index + 1}. **${servico.nome_servico}**\n`;
            if (servico.descricao_servico) {
              response += `   📝 Descrição: ${servico.descricao_servico}\n`;
            }
            if (servico.preco_servico) {
              response += `   💰 Preço: R$ ${servico.preco_servico.toFixed(2)}\n`;
            }
            response += `   👤 Responsável: ${servico.responsavel_servico}\n`;
            response += `   📞 Contato: ${servico.contato_servico}\n\n`;
          });
          
          if (servicos.length > 3) {
            response += `E mais ${servicos.length - 3} serviço(s)...`;
          }
          
          return response;
        } else {
          return 'Não encontrei nenhum serviço cadastrado no momento.';
        }
      } catch (error) {
        return 'Desculpe, ocorreu um erro ao buscar os serviços.';
      }
    }
    
    // Resposta padrão para outras consultas.
    return `Entendi sua pergunta sobre "${query}". Atualmente posso ajudá-lo com informações sobre:

• **Eventos cadastrados** - Digite "eventos" ou "mostrar eventos"
• **Serviços disponíveis** - Digite "serviços" ou "mostrar serviços"

Você também pode fazer perguntas específicas como:
- "Quais eventos temos esta semana?"
- "Mostre-me os serviços disponíveis"
- "Qual o preço dos serviços?"

Como posso ajudá-lo?`;
  };

  /**
   * Envia a mensagem do usuário e obtém a resposta do bot.
   */
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const botResponse = await processUserQuery(input);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lida com o pressionar da tecla Enter no campo de entrada.
   * @param e - O evento de teclado.
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Renderiza a interface de chat.
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat com Assistente Inteligente
        </CardTitle>
        <CardDescription>
          Faça perguntas sobre eventos e serviços cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Área de exibição das mensagens */}
          <ScrollArea className="h-96 border rounded-lg p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-sm">Digitando...</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Área de entrada de texto */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre eventos ou serviços..."
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Mostrar todos os eventos')}
              disabled={loading}
            >
              Ver Eventos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Mostrar todos os serviços')}
              disabled={loading}
            >
              Ver Serviços
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Quais são os próximos eventos?')}
              disabled={loading}
            >
              Próximos Eventos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};