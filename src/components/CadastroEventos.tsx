import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, User, Phone } from "lucide-react";

export const CadastroEventos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_evento: "",
    data_evento: "",
    local_evento: "",
    descricao_evento: "",
    responsavel_evento: "",
    contato_evento: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('eventos')
        .insert([formData]);

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
        
        // Limpar formulário
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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