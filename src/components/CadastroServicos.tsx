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
// Importa o hook useAuth para acessar o contexto de autenticação.
import { useAuth } from "@/contexts/AuthContext";
// Importa ícones da biblioteca lucide-react.
import { Users, DollarSign, Phone } from "lucide-react";

/**
 * Componente para cadastrar novos serviços.
 */
export const CadastroServicos = () => {
  // Obtém a função de toast para exibir notificações.
  const { toast } = useToast();
  // Obtém o perfil do usuário do contexto de autenticação.
  const { profile } = useAuth();
  // Estado para controlar o status de carregamento.
  const [loading, setLoading] = useState(false);
  // Estado para armazenar os dados do formulário.
  const [formData, setFormData] = useState({
    nome_servico: "",
    descricao_servico: "",
    preco_servico: "",
    contato_servico: ""
  });

  /**
   * Lida com o envio do formulário de cadastro de serviços.
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
          description: "Você precisa estar logado para cadastrar serviços.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Prepara os dados para inserção no banco de dados.
      const dataToInsert = {
        ...formData,
        preco_servico: formData.preco_servico ? parseFloat(formData.preco_servico) : null,
        responsavel_servico: profile?.full_name || 'Não informado',
        user_id: user.id
      };

      // Insere os dados do serviço no banco de dados.
      const { error } = await supabase
        .from('servicos')
        .insert([dataToInsert]);

      // Exibe uma notificação de erro ou sucesso.
      if (error) {
        toast({
          title: "Erro ao cadastrar serviço",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Serviço cadastrado com sucesso!",
          description: "O serviço foi adicionado à base de dados."
        });
        
        // Limpa o formulário após o sucesso.
        setFormData({
          nome_servico: "",
          descricao_servico: "",
          preco_servico: "",
          contato_servico: ""
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao cadastrar o serviço.",
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

  // Renderiza o formulário de cadastro de serviços.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Cadastrar Novo Serviço
        </CardTitle>
        <CardDescription>
          Preencha as informações do serviço abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_servico">Nome do Serviço *</Label>
            <Input
              id="nome_servico"
              value={formData.nome_servico}
              onChange={(e) => handleInputChange("nome_servico", e.target.value)}
              placeholder="Digite o nome do serviço"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao_servico">Descrição do Serviço</Label>
            <Textarea
              id="descricao_servico"
              value={formData.descricao_servico}
              onChange={(e) => handleInputChange("descricao_servico", e.target.value)}
              placeholder="Descreva o serviço oferecido..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="preco_servico" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Preço do Serviço
            </Label>
            <Input
              id="preco_servico"
              type="number"
              step="0.01"
              value={formData.preco_servico}
              onChange={(e) => handleInputChange("preco_servico", e.target.value)}
              placeholder="0.00"
            />
          </div>


          <div>
            <Label htmlFor="contato_servico" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contato do Responsável *
            </Label>
            <Input
              id="contato_servico"
              value={formData.contato_servico}
              onChange={(e) => handleInputChange("contato_servico", e.target.value)}
              placeholder="Email ou telefone"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Serviço"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};