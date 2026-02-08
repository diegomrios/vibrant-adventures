import { Tables } from "@/integrations/supabase/types";
import { MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Props {
  pkg: Tables<"packages">;
  view: "grid" | "list";
}

export function PackageCard({ pkg, view }: Props) {
  const { addItem } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  if (view === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <Link to={`/package/${pkg.id}`} className="w-48 h-36 flex-shrink-0">
          <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
        </Link>
        <div className="flex flex-col justify-between py-3 pr-4 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{pkg.category}</span>
              {pkg.featured && <Star className="h-3 w-3 text-primary fill-primary" />}
            </div>
            <Link to={`/package/${pkg.id}`}>
              <h3 className="font-display font-semibold text-card-foreground hover:text-primary transition-colors">{pkg.title}</h3>
            </Link>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pkg.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.duration}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-display text-lg font-bold text-primary">{formatPrice(pkg.price)}</span>
            <Button size="sm" onClick={() => addItem(pkg)}>Adicionar</Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group"
    >
      <Link to={`/package/${pkg.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {pkg.featured && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" /> Destaque
          </div>
        )}
        <div className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-lg capitalize">
          {pkg.category}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/package/${pkg.id}`}>
          <h3 className="font-display font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-1">{pkg.title}</h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pkg.location}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.duration}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pkg.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-lg font-bold text-primary">{formatPrice(pkg.price)}</span>
          <Button size="sm" onClick={() => addItem(pkg)}>Adicionar</Button>
        </div>
      </div>
    </motion.div>
  );
}
