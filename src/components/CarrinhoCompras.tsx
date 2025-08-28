// Importa os hooks useState e useEffect para gerenciar o estado e efeitos colaterais.
import { useState, useEffect } from "react";
// Importa componentes de UI personalizados.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Importa o hook useToast para exibir notificações.
import { useToast } from "@/hooks/use-toast";
// Importa o cliente Supabase para interagir com o banco de dados.
import { supabase } from "@/integrations/supabase/client";
// Importa o hook useAuth para acessar o contexto de autenticação.
import { useAuth } from "@/contexts/AuthContext";
// Importa ícones da biblioteca lucide-react.
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";

// Define a interface para um item do carrinho.
interface CartItem {
  id: string;
  quantity: number;
  servicos: {
    id: string;
    nome_servico: string;
    descricao_servico: string;
    preco_servico: number;
    responsavel_servico: string;
  };
}

/**
 * Componente que exibe o carrinho de compras do usuário.
 */
export const CarrinhoCompras = () => {
  // Obtém a função de toast para exibir notificações.
  const { toast } = useToast();
  // Obtém o usuário autenticado do contexto de autenticação.
  const { user } = useAuth();
  // Estado para armazenar os itens do carrinho.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Estado para controlar o status de carregamento.
  const [loading, setLoading] = useState(false);

  // Busca os itens do carrinho quando o componente é montado ou o usuário muda.
  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  /**
   * Busca os itens do carrinho do usuário no banco de dados.
   */
  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          servicos (
            id,
            nome_servico,
            descricao_servico,
            preco_servico,
            responsavel_servico
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  /**
   * Atualiza a quantidade de um item no carrinho.
   * @param itemId - O ID do item a ser atualizado.
   * @param newQuantity - A nova quantidade do item.
   */
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      toast({
        title: "Erro ao atualizar carrinho",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive"
      });
    }
  };

  /**
   * Remove um item do carrinho.
   * @param itemId - O ID do item a ser removido.
   */
  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
      
      toast({
        title: "Item removido",
        description: "O item foi removido do carrinho."
      });
    } catch (error) {
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item do carrinho.",
        variant: "destructive"
      });
    }
  };

  /**
   * Finaliza a compra, criando um pedido e limpando o carrinho.
   */
  const checkout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const total = cartItems.reduce((sum, item) => 
        sum + (item.servicos.preco_servico * item.quantity), 0
      );

      // Cria um novo pedido no banco de dados.
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_amount: total,
          status: 'paid'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Cria os itens do pedido.
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        servico_id: item.servicos.id,
        quantity: item.quantity,
        price: item.servicos.preco_servico
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpa o carrinho de compras.
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id);

      if (clearError) throw clearError;

      setCartItems([]);
      toast({
        title: "Compra realizada com sucesso!",
        description: `Total: R$ ${total.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Erro no checkout",
        description: "Não foi possível finalizar a compra.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcula o valor total do carrinho.
  const total = cartItems.reduce((sum, item) => 
    sum + (item.servicos.preco_servico * item.quantity), 0
  );

  // Renderiza o componente do carrinho de compras.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Carrinho de Compras
        </CardTitle>
        <CardDescription>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} no carrinho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Seu carrinho está vazio
          </p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{item.servicos.nome_servico}</h4>
                  <p className="text-sm text-muted-foreground">{item.servicos.responsavel_servico}</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {item.servicos.preco_servico.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary">{item.quantity}</Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <Button 
                className="w-full" 
                onClick={checkout}
                disabled={loading || cartItems.length === 0}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading ? "Processando..." : "Finalizar Compra"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};