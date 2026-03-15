"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNotifications, iconForType } from "@/lib/context/NotificationsContext";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/historico", label: "Jornada", icon: BarChart3 },
  { href: "/insights", label: "Dicas", icon: Lightbulb },
  { href: "/perfil", label: "Perfil", icon: User },
];

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)}min atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)}h atrás`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

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
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();

  const [notifOpen, setNotifOpen] = React.useState(false);
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close panel on outside click
  React.useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const handleLogout = () => {
    setLogoutConfirm(false);
    router.push("/login");
  };

  return (
    <>
      <div className={cn(
        "fixed top-3 sm:top-4 right-0 z-50 px-3 sm:px-4 md:px-6 pointer-events-none text-foreground transition-[left] duration-300",
        sidebarCollapsed ? "left-0 md:left-15" : "left-0 md:left-62"
      )}>
        <header className="container mx-auto h-14 sm:h-16 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-3xl shadow-premium supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-black/20 pointer-events-auto flex items-center gap-3 px-4 sm:px-6 md:px-8 ring-1 ring-black/5 dark:ring-white/5">
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
                          ? "bg-primary text-primary-foreground! shadow-lg shadow-primary/20"
                          : "text-muted-foreground! hover:bg-primary/10 hover:text-primary!",
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
                    onClick={() => setLogoutConfirm(true)}
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
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchValue.trim()) {
                    router.push(`/historico?q=${encodeURIComponent(searchValue.trim())}`);
                    setSearchValue("");
                  }
                }}
                className="pl-10 h-10 bg-black/5 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl text-xs font-bold text-foreground"
              />
            </div>

          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="relative px-4 py-2 group">
                <div className={cn(
                  "flex items-center gap-2 text-sm font-bold tracking-tight transition-colors duration-300",
                  pathname === item.href
                    ? "text-primary dark:text-white"
                    : "text-muted-foreground dark:text-white/60 group-hover:text-primary dark:group-hover:text-white"
                )}>
                  <item.icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110", pathname === item.href && "text-primary dark:text-white")} />
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
            {/* Bell — notifications */}
            <div className="relative" ref={panelRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                aria-label="Notificações"
              >
                <Bell className="h-4 w-4" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-background flex items-center justify-center text-[9px] font-black text-white px-0.5"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Notification panel */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-12 right-0 w-80 rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden z-50"
                  >
                    {/* Panel header */}
                    <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <Bell className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm font-black text-foreground">Notificações</p>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-black text-white bg-indigo-500 rounded-full px-1.5 py-0.5">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {notifications.length > 0 && (
                          <>
                            <button
                              onClick={markAllRead}
                              title="Marcar todas como lidas"
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={clearAll}
                              title="Limpar notificações"
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-muted-foreground/30" />
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">Nenhuma notificação</p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {notifications.map(n => (
                            <motion.button
                              key={n.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => markRead(n.id)}
                              className={cn(
                                "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors",
                                n.read ? "hover:bg-muted/50" : "bg-indigo-50/60 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
                              )}
                            >
                              <span className="text-lg shrink-0 leading-none mt-0.5">{iconForType(n.type)}</span>
                              <div className="min-w-0 flex-1">
                                <p className={cn("text-xs font-bold leading-snug", n.read ? "text-foreground/70" : "text-foreground")}>{n.title}</p>
                                {n.body && <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>}
                                <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
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
            <div className="w-px h-5 bg-border dark:bg-white/20 mx-1" />

            {/* Logout */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl text-muted-foreground dark:text-white/60 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              onClick={() => setLogoutConfirm(true)}
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
      </div>

      {/* ── Logout confirmation modal ── */}
      <Dialog open={logoutConfirm} onOpenChange={setLogoutConfirm}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          {/* header */}
          <div className="px-6 pt-7 pb-5 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <LogOut className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Sair do sistema</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Tem certeza que deseja sair da sua conta?
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 text-white text-sm font-black shadow-lg shadow-rose-500/25 hover:opacity-90 transition-opacity"
            >
              Sair
            </motion.button>
            <button
              onClick={() => setLogoutConfirm(false)}
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}