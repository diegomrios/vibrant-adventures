import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface Props {
  category: string | null;
  onCategoryChange: (cat: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

function FilterContent({ category, onCategoryChange, priceRange, onPriceRangeChange, maxPrice }: Omit<Props, "view" | "onViewChange">) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Categoria</Label>
        <div className="flex flex-wrap gap-2">
          {[null, "natureza", "cidade"].map((cat) => (
            <Button
              key={cat ?? "all"}
              size="sm"
              variant={category === cat ? "default" : "outline"}
              onClick={() => onCategoryChange(cat)}
              className="capitalize"
            >
              {cat ?? "Todas"}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold mb-3 block">
          Faixa de Preço: {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
        </Label>
        <Slider
          min={0}
          max={maxPrice}
          step={100}
          value={priceRange}
          onValueChange={(v) => onPriceRangeChange(v as [number, number])}
          className="mt-2"
        />
      </div>
    </div>
  );
}

export function PackageFilters(props: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Desktop filters */}
      <div className="hidden md:block flex-1">
        <FilterContent
          category={props.category}
          onCategoryChange={props.onCategoryChange}
          priceRange={props.priceRange}
          onPriceRangeChange={props.onPriceRangeChange}
          maxPrice={props.maxPrice}
        />
      </div>

      {/* Mobile filter drawer */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent
                category={props.category}
                onCategoryChange={(cat) => { props.onCategoryChange(cat); setSheetOpen(false); }}
                priceRange={props.priceRange}
                onPriceRangeChange={props.onPriceRangeChange}
                maxPrice={props.maxPrice}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
        <Button
          variant={props.view === "grid" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => props.onViewChange("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={props.view === "list" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => props.onViewChange("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
