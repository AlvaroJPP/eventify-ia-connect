-- Criar tabela de eventos
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_evento TEXT NOT NULL,
  data_evento DATE NOT NULL,
  local_evento TEXT NOT NULL,
  descricao_evento TEXT,
  responsavel_evento TEXT NOT NULL,
  contato_evento TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_servico TEXT NOT NULL,
  descricao_servico TEXT,
  preco_servico DECIMAL(10,2),
  responsavel_servico TEXT NOT NULL,
  contato_servico TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos (acesso público para leitura, mas ainda controlado)
CREATE POLICY "Todos podem visualizar eventos" 
ON public.eventos 
FOR SELECT 
USING (true);

CREATE POLICY "Todos podem criar eventos" 
ON public.eventos 
FOR INSERT 
WITH CHECK (true);

-- Políticas para serviços (acesso público para leitura, mas ainda controlado)
CREATE POLICY "Todos podem visualizar servicos" 
ON public.servicos 
FOR SELECT 
USING (true);

CREATE POLICY "Todos podem criar servicos" 
ON public.servicos 
FOR INSERT 
WITH CHECK (true);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para timestamp automático
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();