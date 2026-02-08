import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormData } from "@/lib/validators";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const onSubmit = async (_data: CheckoutFormData) => {
    if (!user || items.length === 0) return;
    setProcessing(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total })
      .select()
      .single();

    if (orderError) {
      toast({ title: "Erro", description: orderError.message, variant: "destructive" });
      setProcessing(false);
      return;
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      package_id: item.package.id,
      quantity: item.quantity,
      price: item.package.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      toast({ title: "Erro", description: itemsError.message, variant: "destructive" });
      setProcessing(false);
      return;
    }

    setProcessing(false);
    setSuccess(true);
    clearCart();
    setTimeout(() => navigate("/orders"), 3000);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0 && !success) {
    navigate("/");
    return null;
  }

  return (
    <div className="container max-w-lg py-8">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Compra Realizada!</h2>
            <p className="text-muted-foreground">Redirecionando para seus pedidos...</p>
          </motion.div>
        ) : processing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold">Processando pagamento...</h2>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold mb-6">Checkout</h1>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2">
              {items.map((item) => (
                <div key={item.package.id} className="flex justify-between text-sm">
                  <span>{item.package.title} x{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.package.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-display font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
                {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>}
              </div>
              <div>
                <Label htmlFor="cardNumber">Número do cartão</Label>
                <Input id="cardNumber" placeholder="0000 0000 0000 0000" {...register("cardNumber")} />
                {errors.cardNumber && <p className="text-sm text-destructive mt-1">{errors.cardNumber.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input id="expiry" placeholder="MM/AA" {...register("expiry")} />
                  {errors.expiry && <p className="text-sm text-destructive mt-1">{errors.expiry.message}</p>}
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="000" {...register("cvv")} />
                  {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv.message}</p>}
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full">Pagar {formatPrice(total)}</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
