"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Bell,
  Search,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/historico", label: "Jornada", icon: BarChart3 },
  { href: "/insights", label: "Dicas", icon: Lightbulb },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function Navbar({
  onToggleTheme,
  themeLabel,
  sidebarCollapsed = false,
}: {
  onToggleTheme: () => void;
  themeLabel: "dark" | "light";
  sidebarCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    router.push("/login");
  };

  return (
    <div className={cn(
      "fixed top-4 right-0 z-50 px-4 md:px-8 pointer-events-none text-foreground transition-[left] duration-300",
      sidebarCollapsed ? "left-0 md:left-15" : "left-0 md:left-62"
    )}>
      <header className="container mx-auto h-16 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-3xl shadow-premium supports-backdrop-filter:bg-white/50 pointer-events-auto flex items-center gap-4 px-6 md:px-8 ring-1 ring-black/5">
        <div className="flex items-center gap-6 flex-1">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-primary/10 transition-colors rounded-xl"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-75 p-6 border-r-primary/5 rounded-r-4xl">
              <div className="mb-8">
                <Logo small />
              </div>
              <nav className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                      pathname === item.href 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-primary/5 grid gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start h-12 rounded-xl border-primary/10 hover:bg-primary/5 transition-all font-bold text-sm"
                  onClick={onToggleTheme}
                >
                  {themeLabel === "dark" ? (
                    <Sun className="mr-3 h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="mr-3 h-5 w-5 text-indigo-500" />
                  )}
                  Modo {themeLabel === "dark" ? "Claro" : "Escuro"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start h-12 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
                  onClick={logout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair da conta
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="transition-transform active:scale-95">
            <Logo small />
          </Link>

          <div className="relative hidden lg:flex items-center w-64 group">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar registros..."
              className="pl-10 h-10 bg-black/5 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl text-xs font-bold text-foreground"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 group"
            >
              <div className={cn(
                "flex items-center gap-2 text-sm font-bold tracking-tight transition-colors duration-300",
                pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )}>
                <item.icon className={cn(
                  "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                  pathname === item.href && "text-primary"
                )} />
                <span>{item.label}</span>
              </div>
              {pathname === item.href && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute -bottom-4.5 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {/* Bell */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary border border-white dark:border-background" />
          </Button>

          {/* Theme toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-xl hover:bg-muted/70 transition-colors"
            onClick={onToggleTheme}
            aria-label="Alternar tema"
          >
            {themeLabel === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400" />
            )}
          </Button>

          {/* Divider */}
          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Logout */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/8 transition-colors"
            onClick={logout}
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
    </div>
  );
}
