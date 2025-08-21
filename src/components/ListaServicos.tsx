// src/components/ListaServicos.tsx

// Importa os hooks useState e useEffect para gerenciar o estado e efeitos colaterais.
import { useState, useEffect } from "react";
// Importa componentes de UI personalizados.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Importa o hook useToast para exibir notificações.
import { useToast } from "@/hooks/use-toast";
// Importa o cliente Supabase para interagir com o banco de dados.
import { supabase } from "@/integrations/supabase/client";
// Importa o hook useAuth para acessar o contexto de autenticação.
import { useAuth } from "@/contexts/AuthContext";
// Importa ícones da biblioteca lucide-react.
import { Users, DollarSign, User, Phone, ShoppingCart } from "lucide-react";

// Define a interface para um serviço.
interface Servico {
  id: string;
  nome_servico: string;
  descricao_servico: string;
  preco_servico: number;
  responsavel_servico: string;
  contato_servico: string;
  created_at: string;
}

/**
 * Componente que exibe uma lista de serviços cadastrados,
 * com atualizações em tempo real diretamente do Supabase.
 */
export const ListaServicos = () => {
  // Obtém a função de toast para exibir notificações.
  const { toast } = useToast();
  // Obtém o usuário e o perfil do contexto de autenticação.
  const { user, profile } = useAuth();
  // Estado para armazenar a lista de serviços.
  const [servicos, setServicos] = useState<Servico[]>([]);
  // Estado para controlar o status de carregamento.
  const [loading, setLoading] = useState(true);

  // Efeito para buscar os dados iniciais e se inscrever para atualizações.
  useEffect(() => {
    console.log('ListaServicos: Componente montado. Iniciando busca de dados.');

    /**
     * Busca os serviços no banco de dados e atualiza o estado.
     */
    const fetchServicos = async () => {
      console.log('ListaServicos: Buscando dados iniciais...');
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('ListaServicos: Erro ao carregar serviços:', error);
      } else {
        console.log(`ListaServicos: Dados recebidos. Quantidade: ${data.length}`);
        setServicos(data || []);
      }
      // Garante que o loading seja desativado após a primeira busca.
      setLoading(false);
      console.log('ListaServicos: Carregamento inicial finalizado.');
    };

    // Chama a função para buscar os dados iniciais.
    fetchServicos();

    // Configura a subscrição em tempo real do Supabase.
    const channel = supabase
      .channel('servicos-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'servicos' },
        (payload) => {
          console.log('ListaServicos: Alteração em tempo real recebida!', payload);
          // Quando uma alteração ocorre, busca todos os serviços novamente.
          fetchServicos();
        }
      )
      .subscribe((status) => {
        console.log('ListaServicos: Status da subscrição em tempo real:', status);
      });

    // Função de limpeza: remove a subscrição quando o componente é desmontado.
    return () => {
      console.log('ListaServicos: Desmontando componente e removendo subscrição.');
      supabase.removeChannel(channel);
    };
  }, []); // O array vazio assegura que este efeito rode apenas uma vez.

  /**
   * Adiciona um serviço ao carrinho de compras.
   */
  const addToCart = async (servicoId: string) => {
    // ... (código do addToCart permanece o mesmo)
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para adicionar itens ao carrinho.",
        variant: "destructive"
      });
      return;
    }

    if (profile?.user_type !== 'usuario') {
      toast({
        title: "Acesso negado",
        description: "Apenas usuários podem contratar serviços.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          servico_id: servicoId,
          quantity: 1
        }, {
          onConflict: 'user_id,servico_id'
        });

      if (error) throw error;

      toast({
        title: "Adicionado ao carrinho!",
        description: "O serviço foi adicionado ao seu carrinho."
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar ao carrinho",
        description: "Não foi possível adicionar o serviço ao carrinho.",
        variant: "destructive"
      });
    }
  };

  /**
   * Formata um número para o formato de moeda brasileira.
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Exibe uma mensagem de carregamento.
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando serviços...</p>
        </CardContent>
      </Card>
    );
  }

  // Renderiza a lista de serviços.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Serviços Cadastrados
        </CardTitle>
        <CardDescription>
          Total de {servicos.length} serviço(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {servicos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum serviço cadastrado ainda.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {servicos.map((servico) => (
              <Card key={servico.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{servico.nome_servico}</CardTitle>
                    {servico.preco_servico && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatPrice(servico.preco_servico)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {servico.descricao_servico && (
                    <p className="text-sm">{servico.descricao_servico}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{servico.responsavel_servico}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{servico.contato_servico}</span>
                  </div>
                  {profile?.user_type === 'usuario' && (
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => addToCart(servico.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};