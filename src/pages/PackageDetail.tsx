import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleAdd = () => {
    if (!pkg) return;
    addItem(pkg);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-96 rounded-xl mb-6" />
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!pkg) {
    return <div className="container py-16 text-center text-muted-foreground">Pacote não encontrado.</div>;
  }

  const gallery = pkg.gallery?.length ? pkg.gallery : [pkg.image_url];

  return (
    <div className="container py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <motion.div
            key={selectedImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/3] rounded-xl overflow-hidden mb-3"
          >
            <img src={gallery[selectedImg]} alt={pkg.title} className="w-full h-full object-cover" />
          </motion.div>
          {gallery.length > 1 && (
            <div className="flex gap-2">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImg ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{pkg.category}</span>
            {pkg.featured && <Star className="h-4 w-4 text-primary fill-primary" />}
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">{pkg.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{pkg.location}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{pkg.duration}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">{pkg.description}</p>

          <div className="flex items-center gap-4">
            <span className="font-display text-3xl font-bold text-primary">{formatPrice(pkg.price)}</span>
            <Button size="lg" onClick={handleAdd} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    Adicionado! ✓
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    Adicionar ao Carrinho
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
