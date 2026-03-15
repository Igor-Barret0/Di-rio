"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, ArrowLeft,
  Shield, LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, getStoredTokens, clearTokens } from "@/lib/api/client";
import { LogoutModal } from "@/components/shared/LogoutModal";

const NAV = [
  { href: "/admin",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários",   icon: Users },
  { href: "/admin/recursos", label: "Recursos",   icon: BookOpen },
];

function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const handleLogout = async () => {
    const tokens = getStoredTokens();
    if (tokens) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch { /* ignore */ }
    }
    clearTokens();
    router.replace("/login");
  };

  return (
    <>
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 text-gray-600">
      <div className="flex flex-col h-full py-4">
        {/* Logo + badge */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-black text-gray-800 tracking-tight">Admin Panel</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium pl-9">Diário Emocional</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && (pathname?.startsWith(item.href) ?? false));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="admin-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <div className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0",
                  isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200",
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pt-3 border-t border-gray-200 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all group text-sm font-medium"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Voltar ao App
          </Link>
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-rose-500 hover:bg-rose-50 transition-all group text-sm font-medium"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-rose-100 shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            Sair
          </button>
          <div className="pt-2 mt-1 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{name}</p>
                <p className="text-[10px] text-gray-400 font-medium">Admin</p>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-300 ml-auto shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </aside>
    <LogoutModal
      open={confirmLogout}
      onClose={() => setConfirmLogout(false)}
      onConfirm={handleLogout}
    />
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [name, setName]   = React.useState("Admin");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!getStoredTokens()) { router.replace("/login"); return; }

    apiFetch<{ role: string; name: string }>("/auth/me")
      .then((u) => {
        if (u.role !== "ADMIN" && u.role !== "COUNSELOR") {
          router.replace("/dashboard");
          return;
        }
        setName(u.name);
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="force-light min-h-screen flex bg-background">
      <AdminSidebar name={name} />
      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
