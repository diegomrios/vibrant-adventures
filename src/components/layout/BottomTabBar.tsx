import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Buscar", path: "/?search=true" },
  { icon: ShoppingCart, label: "Carrinho", path: "/cart" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export function BottomTabBar() {
  const location = useLocation();
  const { itemCount, setIsOpen } = useCart();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = tab.path === "/" ? location.pathname === "/" : location.pathname === tab.path;
          const Icon = tab.icon;

          const handleClick = (e: React.MouseEvent) => {
            if (tab.label === "Carrinho") {
              e.preventDefault();
              setIsOpen(true);
            }
            if (tab.label === "Perfil" && !user) {
              e.preventDefault();
              window.location.href = "/auth";
            }
          };

          return (
            <Link
              key={tab.label}
              to={tab.label === "Perfil" ? (user ? "/orders" : "/auth") : tab.path}
              onClick={handleClick}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label === "Carrinho" && itemCount > 0 && (
                <Badge className="absolute -top-1 right-0 h-4 w-4 p-0 flex items-center justify-center text-[9px]">
                  {itemCount}
                </Badge>
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
