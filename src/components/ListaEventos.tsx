// src/components/ListaEventos.tsx

// Importa os hooks useState e useEffect para gerenciar o estado e efeitos colaterais.
import { useEffect, useState } from "react";
// Importa componentes de UI personalizados.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Importa o cliente Supabase para interagir com o banco de dados.
import { supabase } from "@/integrations/supabase/client";
// Importa ícones da biblioteca lucide-react.
import { Calendar, MapPin, User, Phone } from "lucide-react";
// Importa a função format da biblioteca date-fns para formatar datas.
import { format } from "date-fns";
// Importa a localização para o português do Brasil para a formatação de datas.
import { ptBR } from "date-fns/locale";

// Define a interface para um evento.
interface Evento {
  id: string;
  nome_evento: string;
  data_evento: string;
  local_evento: string;
  descricao_evento: string;
  responsavel_evento: string;
  contato_evento: string;
  created_at: string;
}

/**
 * Componente que exibe uma lista de eventos cadastrados,
 * com atualizações em tempo real diretamente do Supabase.
 */
export const ListaEventos = () => {
  // Estado para armazenar a lista de eventos.
  const [eventos, setEventos] = useState<Evento[]>([]);
  // Estado para controlar o status de carregamento.
  const [loading, setLoading] = useState(true);

  // Efeito para buscar os dados iniciais e se inscrever para atualizações.
  useEffect(() => {
    console.log('ListaEventos: Componente montado. Iniciando busca de dados.');

    /**
     * Busca os eventos no banco de dados e atualiza o estado.
     */
    const fetchEventos = async () => {
      console.log('ListaEventos: Buscando dados iniciais...');
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_evento', { ascending: true });

      if (error) {
        console.error('ListaEventos: Erro ao buscar eventos:', error);
      } else {
        console.log(`ListaEventos: Dados recebidos. Quantidade: ${data.length}`);
        setEventos(data || []);
      }
      // Garante que o loading seja desativado após a primeira busca.
      setLoading(false);
      console.log('ListaEventos: Carregamento inicial finalizado.');
    };

    // Chama a função para buscar os dados iniciais.
    fetchEventos();

    // Configura a subscrição em tempo real do Supabase.
    const channel = supabase
      .channel('eventos-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        (payload) => {
          console.log('ListaEventos: Alteração em tempo real recebida!', payload);
          // Quando uma alteração ocorre, busca todos os eventos novamente.
          fetchEventos();
        }
      )
      .subscribe((status) => {
        console.log('ListaEventos: Status da subscrição em tempo real:', status);
      });

    // Função de limpeza: remove a subscrição quando o componente é desmontado.
    return () => {
      console.log('ListaEventos: Desmontando componente e removendo subscrição.');
      supabase.removeChannel(channel);
    };
  }, []); // O array vazio assegura que este efeito rode apenas uma vez.

  /**
   * Formata uma string de data para um formato legível.
   */
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
  };

  // Exibe uma mensagem de carregamento.
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando eventos...</p>
        </CardContent>
      </Card>
    );
  }

  // Renderiza a lista de eventos.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Eventos Cadastrados
        </CardTitle>
        <CardDescription>
          Total de {eventos.length} evento(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {eventos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum evento cadastrado ainda.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {eventos.map((evento) => (
              <Card key={evento.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{evento.nome_evento}</CardTitle>
                    <Badge variant="secondary">
                      {formatDate(evento.data_evento)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{evento.local_evento}</span>
                  </div>
                  {evento.descricao_evento && (
                    <p className="text-sm">{evento.descricao_evento}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{evento.responsavel_evento}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{evento.contato_evento}</span>
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