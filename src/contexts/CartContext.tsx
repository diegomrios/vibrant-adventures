import { createContext, useContext, useState, ReactNode } from "react";
import { Tables } from "@/integrations/supabase/types";

export interface CartItem {
  package: Tables<"packages">;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (pkg: Tables<"packages">) => void;
  removeItem: (packageId: string) => void;
  updateQuantity: (packageId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (pkg: Tables<"packages">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.package.id === pkg.id);
      if (existing) {
        return prev.map((i) =>
          i.package.id === pkg.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { package: pkg, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (packageId: string) => {
    setItems((prev) => prev.filter((i) => i.package.id !== packageId));
  };

  const updateQuantity = (packageId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(packageId);
    setItems((prev) =>
      prev.map((i) =>
        i.package.id === packageId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.package.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}
