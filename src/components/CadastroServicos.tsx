import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, User, Phone } from "lucide-react";

export const CadastroServicos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_servico: "",
    descricao_servico: "",
    preco_servico: "",
    responsavel_servico: "",
    contato_servico: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para cadastrar serviços.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const dataToInsert = {
        ...formData,
        preco_servico: formData.preco_servico ? parseFloat(formData.preco_servico) : null,
        user_id: user.id
      };

      const { error } = await supabase
        .from('servicos')
        .insert([dataToInsert]);

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
        
        // Limpar formulário
        setFormData({
          nome_servico: "",
          descricao_servico: "",
          preco_servico: "",
          responsavel_servico: "",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            <Label htmlFor="responsavel_servico" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Responsável pelo Serviço *
            </Label>
            <Input
              id="responsavel_servico"
              value={formData.responsavel_servico}
              onChange={(e) => handleInputChange("responsavel_servico", e.target.value)}
              placeholder="Nome do responsável"
              required
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