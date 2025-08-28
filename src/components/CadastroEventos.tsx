// Importa o hook useState para gerenciar o estado do componente.
import { useState } from "react";
// Importa componentes de UI personalizados.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Importa o hook useToast para exibir notificações.
import { useToast } from "@/hooks/use-toast";
// Importa o cliente Supabase para interagir com o banco de dados.
import { supabase } from "@/integrations/supabase/client";
// Importa ícones da biblioteca lucide-react.
import { Calendar, MapPin, User, Phone } from "lucide-react";

/**
 * Componente para cadastrar novos eventos.
 */
export const CadastroEventos = () => {
  // Obtém a função de toast para exibir notificações.
  const { toast } = useToast();
  // Estado para controlar o status de carregamento.
  const [loading, setLoading] = useState(false);
  // Estado para armazenar os dados do formulário.
  const [formData, setFormData] = useState({
    nome_evento: "",
    data_evento: "",
    local_evento: "",
    descricao_evento: "",
    responsavel_evento: "",
    contato_evento: ""
  });

  /**
   * Lida com o envio do formulário de cadastro de eventos.
   * @param e - O evento do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtém o usuário autenticado.
      const { data: { user } } = await supabase.auth.getUser();
      
      // Se não houver usuário, exibe uma notificação de erro.
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para cadastrar eventos.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Insere os dados do evento no banco de dados.
      const { error } = await supabase
        .from('eventos')
        .insert([{ ...formData, user_id: user.id }]);

      // Exibe uma notificação de erro ou sucesso.
      if (error) {
        toast({
          title: "Erro ao cadastrar evento",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Evento cadastrado com sucesso!",
          description: "O evento foi adicionado à base de dados."
        });
        
        // Limpa o formulário após o sucesso.
        setFormData({
          nome_evento: "",
          data_evento: "",
          local_evento: "",
          descricao_evento: "",
          responsavel_evento: "",
          contato_evento: ""
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao cadastrar o evento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza o estado do formulário quando um campo de entrada muda.
   * @param field - O nome do campo.
   * @param value - O novo valor do campo.
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Renderiza o formulário de cadastro de eventos.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Cadastrar Novo Evento
        </CardTitle>
        <CardDescription>
          Preencha as informações do evento abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_evento">Nome do Evento *</Label>
            <Input
              id="nome_evento"
              value={formData.nome_evento}
              onChange={(e) => handleInputChange("nome_evento", e.target.value)}
              placeholder="Digite o nome do evento"
              required
            />
          </div>

          <div>
            <Label htmlFor="data_evento">Data do Evento *</Label>
            <Input
              id="data_evento"
              type="date"
              value={formData.data_evento}
              onChange={(e) => handleInputChange("data_evento", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="local_evento" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Local do Evento *
            </Label>
            <Input
              id="local_evento"
              value={formData.local_evento}
              onChange={(e) => handleInputChange("local_evento", e.target.value)}
              placeholder="Digite o local do evento"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao_evento">Descrição do Evento</Label>
            <Textarea
              id="descricao_evento"
              value={formData.descricao_evento}
              onChange={(e) => handleInputChange("descricao_evento", e.target.value)}
              placeholder="Descreva o evento..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="responsavel_evento" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Responsável pelo Evento *
            </Label>
            <Input
              id="responsavel_evento"
              value={formData.responsavel_evento}
              onChange={(e) => handleInputChange("responsavel_evento", e.target.value)}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div>
            <Label htmlFor="contato_evento" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contato do Responsável *
            </Label>
            <Input
              id="contato_evento"
              value={formData.contato_evento}
              onChange={(e) => handleInputChange("contato_evento", e.target.value)}
              placeholder="Email ou telefone"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Evento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};