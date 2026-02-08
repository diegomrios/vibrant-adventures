import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BottomTabBar } from "./BottomTabBar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { ChatWidget } from "@/components/chat/ChatWidget";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomTabBar />
      <CartSidebar />
      <ChatWidget />
    </div>
  );
}
