import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";

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

export const CarrinhoCompras = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

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

  const checkout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const total = cartItems.reduce((sum, item) => 
        sum + (item.servicos.preco_servico * item.quantity), 0
      );

      // Create order
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

      // Create order items
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

      // Clear cart
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

  const total = cartItems.reduce((sum, item) => 
    sum + (item.servicos.preco_servico * item.quantity), 0
  );

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