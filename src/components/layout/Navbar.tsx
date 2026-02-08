import { Link } from "react-router-dom";
import { Compass, ShoppingCart, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            Vibrant<span className="text-primary">Travel</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">Pacotes</Button>
          </Link>
          {user && (
            <Link to="/orders">
              <Button variant="ghost" size="sm">Meus Pedidos</Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Shield className="h-4 w-4 mr-1" /> Admin
              </Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(true)}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {itemCount}
              </Badge>
            )}
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
