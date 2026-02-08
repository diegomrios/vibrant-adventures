import { useState, useMemo } from "react";
import { usePackages } from "@/hooks/usePackages";
import { PackageCard } from "@/components/packages/PackageCard";
import { PackageFilters } from "@/components/packages/PackageFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
  const { data: packages, isLoading } = usePackages();
  const [category, setCategory] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const maxPrice = useMemo(() => Math.max(...(packages?.map((p) => p.price) ?? [10000]), 10000), [packages]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  // Reset max when data loads
  useMemo(() => {
    if (packages?.length) setPriceRange([0, Math.max(...packages.map((p) => p.price))]);
  }, [packages]);

  const filtered = useMemo(() => {
    if (!packages) return [];
    return packages.filter((p) => {
      if (category && p.category !== category) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [packages, category, priceRange]);

  return (
    <div className="container py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
          <Compass className="h-4 w-4" /> Sua próxima aventura começa aqui
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
          Descubra o <span className="text-primary">Mundo</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Pacotes de viagem selecionados para quem busca experiências inesquecíveis.
        </p>
      </motion.div>

      <PackageFilters
        category={category}
        onCategoryChange={setCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        maxPrice={maxPrice}
        view={view}
        onViewChange={setView}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className={view === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
        }>
          {filtered.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} view={view} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              Nenhum pacote encontrado com esses filtros.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
