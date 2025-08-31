import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Eu sou seu assistente inteligente. Posso ajudá-lo a encontrar informações sobre eventos e serviços cadastrados. O que você gostaria de saber?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Função para enviar dados para o webhook do n8n e receber resposta
  const sendToWebhook = async (message: string, userInfo: any) => {
    try {
      const webhookData = {
        message,
        user: {
          id: userInfo?.id,
          email: userInfo?.email,
          name: profile?.full_name,
          user_type: profile?.user_type
        },
        timestamp: new Date().toISOString(),
        platform: 'eventify-chat'
      };

      const response = await fetch('https://sailfish-ready-gibbon.ngrok-free.app/webhook/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook enviado com sucesso:', result);
      
      // Extrair a resposta do agente do resultado
      let agentResponse = '';
      
      if (result.response) {
        agentResponse = result.response;
      } else if (result.message) {
        agentResponse = result.message;
      } else if (result.text) {
        agentResponse = result.text;
      } else if (result.output) {
        agentResponse = result.output;
      } else if (typeof result === 'string') {
        agentResponse = result;
      } else {
        agentResponse = 'Recebi sua mensagem e estou processando...';
      }
      
      return {
        success: true,
        data: result,
        agentResponse: agentResponse
      };
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      throw error;
    }
  };

  const processUserQuery = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    // Consultas sobre eventos
    if (lowerQuery.includes('evento') || lowerQuery.includes('próximo') || lowerQuery.includes('proximo')) {
      try {
        const { data: eventos, error } = await supabase
          .from('eventos')
          .select('*')
          .order('data_evento', { ascending: true });

        if (error) throw error;

        if (eventos && eventos.length > 0) {
          let response = `Encontrei ${eventos.length} evento(s) cadastrado(s):\n\n`;
          eventos.slice(0, 3).forEach((evento, index) => {
            response += `**${index + 1}. ${evento.nome_evento}**\n`;
            response += `Data: ${new Date(evento.data_evento).toLocaleDateString('pt-BR')}\n`;
            response += `Local: ${evento.local_evento}\n`;
            response += `Responsável: ${evento.responsavel_evento}\n`;
            if (evento.descricao_evento) {
              response += `Descrição: ${evento.descricao_evento}\n`;
            }
            response += `Contato: ${evento.contato_evento}\n\n`;
          });
          
          if (eventos.length > 3) {
            response += `E mais ${eventos.length - 3} evento(s)...`;
          }
          
          return response;
        } else {
          return '❌ Não encontrei nenhum evento cadastrado no momento.';
        }
      } catch (error) {
        return '❌ Desculpe, ocorreu um erro ao buscar os eventos.';
      }
    }
    
    // Consultas sobre serviços
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
            response += `**${index + 1}. ${servico.nome_servico}**\n`;
            if (servico.descricao_servico) {
              response += `Descrição: ${servico.descricao_servico}\n`;
            }
            if (servico.preco_servico) {
              response += `Preço: R$ ${servico.preco_servico.toFixed(2)}\n`;
            }
            response += `Responsável: ${servico.responsavel_servico}\n`;
            response += `Contato: ${servico.contato_servico}\n\n`;
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
    
    // Resposta padrão para outras consultas
    return `Entendi sua pergunta sobre "${query}". Atualmente posso ajudá-lo com informações sobre:

• **Eventos cadastrados** - Digite "eventos" ou "mostrar eventos"
• **Serviços disponíveis** - Digite "serviços" ou "mostrar serviços"

Você também pode fazer perguntas específicas como:
- "Quais eventos temos esta semana?"
- "Mostre-me os serviços disponíveis"
- "Qual o preço dos serviços?"

Como posso ajudá-lo? 😊`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setIsTyping(true);

    // Small delay to show typing indicator
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      let botResponse = '';
      let webhookSuccess = false;

      // Tentar enviar para o webhook do n8n primeiro
      try {
        const webhookResult = await sendToWebhook(currentInput, user);
        if (webhookResult.success && webhookResult.agentResponse) {
          botResponse = webhookResult.agentResponse;
          webhookSuccess = true;
        }
      } catch (webhookError) {
        console.warn('Webhook falhou, usando processamento local:', webhookError);
        webhookSuccess = false;
      }

      // Se o webhook falhou, usar processamento local como fallback
      if (!webhookSuccess || !botResponse.trim()) {
        botResponse = await processUserQuery(currentInput);
      }
      
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
        content: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: "Ver Eventos", query: "Mostrar todos os eventos" },
    { label: "Ver Serviços", query: "Mostrar todos os serviços" },
    { label: "Como funciona?", query: "Como posso usar esta plataforma?" },
    { label: "Sobre o Pará", query: "Me fale sobre eventos no Pará" }
  ];

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800">
      <CardHeader className="bg-gradient-to-r from-dark-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <span>Chat com Assistente Inteligente</span>
            <div className="text-sm opacity-90 font-normal">
              Sempre disponível
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-white/90">
          Faça perguntas sobre eventos e serviços cadastrados no Pará
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* Chat Messages */}
          <ScrollArea ref={scrollAreaRef} className="h-[500px] p-6">
            <div 
              className="space-y-6" 
              role="log" 
              aria-live="polite" 
              aria-label="Conversa com assistente"
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  role="article"
                  aria-label={`Mensagem ${message.type === 'user' ? 'do usuário' : 'do assistente'}`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-dark-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col gap-1">
                      <div
                        className={`rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-md'
                        }`}
                      >
                        <div 
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                          style={{ wordBreak: 'break-word' }}
                        >
                          {message.content}
                        </div>
                      </div>
                      <div 
                        className={`text-xs text-slate-500 dark:text-slate-400 px-2 ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-4 justify-start" role="status" aria-label="Assistente digitando">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-dark-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md p-4 border border-slate-200 dark:border-slate-600 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Digitando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {/* <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">Sugestões rápidas:</div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(action.query)}
                  disabled={loading}
                  className="text-xs h-8 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-colors"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div> */}

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre eventos ou serviços..."
                disabled={loading}
                className="text-sm"
              />
              <Button onClick={handleSendMessage} disabled={loading || !input.trim()} className="h-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};