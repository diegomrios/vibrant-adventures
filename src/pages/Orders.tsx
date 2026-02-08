import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, packages(*))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const exportData = () => {
    if (!orders) return;
    const csv = [
      "Pedido,Data,Pacote,Quantidade,Preço,Total Pedido",
      ...orders.flatMap((order) =>
        (order.order_items as any[]).map((item: any) =>
          `${order.id},${new Date(order.created_at).toLocaleDateString("pt-BR")},${item.packages?.title ?? ""},${item.quantity},${item.price},${order.total}`
        )
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-pedidos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Meus Pedidos</h1>
        {orders && orders.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportData} className="gap-1">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                  {order.status}
                </span>
              </div>
              <div className="space-y-2">
                {(order.order_items as any[]).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.packages?.image_url && (
                      <img src={item.packages.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.packages?.title ?? "Pacote"}</p>
                      <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-2 flex justify-end">
                <span className="font-display font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
