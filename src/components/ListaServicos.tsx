import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, DollarSign, User, Phone, ShoppingCart } from "lucide-react";

interface Servico {
  id: string;
  nome_servico: string;
  descricao_servico: string;
  preco_servico: number;
  responsavel_servico: string;
  contato_servico: string;
  created_at: string;
}

export const ListaServicos = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar serviços:', error);
      } else {
        setServicos(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (servicoId: string) => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

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