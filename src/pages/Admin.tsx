import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("packages").insert({
        title,
        price: parseFloat(price),
        image_url: imageUrl,
        category,
        location,
        duration,
        description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast({ title: "Pacote adicionado!" });
      setTitle(""); setPrice(""); setImageUrl(""); setCategory(""); setLocation(""); setDuration(""); setDescription("");
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast({ title: "Pacote removido" });
    },
  });

  if (!authLoading && (!user || !isAdmin)) {
    navigate("/");
    return null;
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p);

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold">Painel Admin</h1>
      </div>

      {/* Add package form */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Novo Pacote
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Preço (R$)</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label>URL da Foto</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="natureza">Natureza</SelectItem>
                <SelectItem value="cidade">Cidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Localização</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label>Duração</Label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 5 dias" />
          </div>
          <div className="sm:col-span-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-4"
          disabled={!title || !price || !category || addMutation.isPending}
          onClick={() => addMutation.mutate()}
        >
          {addMutation.isPending ? "Salvando..." : "Adicionar Pacote"}
        </Button>
      </div>

      {/* Package list */}
      <h2 className="font-display font-semibold text-lg mb-4">Pacotes Existentes</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {packages?.map((pkg) => (
            <div key={pkg.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <img src={pkg.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{pkg.title}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(pkg.price)} · {pkg.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => deleteMutation.mutate(pkg.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
