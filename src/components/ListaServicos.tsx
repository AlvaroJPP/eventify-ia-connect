import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, User, Phone } from "lucide-react";

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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};