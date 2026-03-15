"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Search, Users, ChevronRight, ChevronLeft, ChevronDown,
  Trash2, UserCheck, UserX, Loader2, BookHeart, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface AdminUser {
  id: string; name: string; email: string;
  role: "STUDENT" | "COUNSELOR" | "ADMIN"; plan: "FREE" | "PRO";
  isActive: boolean; createdAt: string;
  _count: { moodRecords: number; assessments: number; goals: number };
}

const ROLE_CONFIG = {
  STUDENT:   { label: "Estudante",   color: "text-indigo-700 dark:text-indigo-400",  bg: "bg-indigo-50 dark:bg-indigo-950/30",  border: "border-indigo-200/50 dark:border-indigo-800/30" },
  COUNSELOR: { label: "Conselheiro", color: "text-violet-700 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200/50 dark:border-violet-800/30" },
  ADMIN:     { label: "Admin",       color: "text-rose-700 dark:text-rose-400",      bg: "bg-rose-50 dark:bg-rose-950/30",      border: "border-rose-200/50 dark:border-rose-800/30" },
};

export default function AdminUsuarios() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const limit = 20;
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await apiFetch<{ users: AdminUser[]; meta: { total: number } }>(`/admin/users?${params}`);
      setUsers(res.users); setTotal(res.meta.total);
    } catch { toast.error("Erro ao carregar usuários."); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (v: string) => {
    setSearch(v); setPage(1);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchUsers(), 400);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !current }) });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
      toast.success(current ? "Usuário desativado." : "Usuário ativado.");
    } catch { toast.error("Erro ao atualizar."); }
    finally { setUpdatingId(null); }
  };

  const handleChangeRole = async (id: string, role: string) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role as AdminUser["role"] } : u));
      toast.success("Papel atualizado.");
    } catch { toast.error("Erro ao atualizar."); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, name });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setTotal(t => t - 1);
      toast.success("Usuário excluído.");
      setDeleteTarget(null);
    } catch { toast.error("Erro ao excluir."); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
    <div className="space-y-5 pb-14">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Usuários</h1>
            <p className="text-xs text-muted-foreground font-medium">{total} cadastrados</p>
          </div>
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="pl-9 h-10 rounded-xl bg-card border-border/60 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/40">
          {([
            { value: "",           label: "Todos"       },
            { value: "STUDENT",    label: "Estudante"   },
            { value: "COUNSELOR",  label: "Conselheiro" },
            { value: "ADMIN",      label: "Admin"       },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => { setRoleFilter(opt.value); setPage(1); }}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-bold transition-all",
                roleFilter === opt.value
                  ? opt.value === ""           ? "bg-card shadow-sm text-foreground border border-border/50"
                  : opt.value === "STUDENT"    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                  : opt.value === "COUNSELOR"  ? "bg-violet-500 text-white shadow-sm shadow-violet-500/30"
                  :                              "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── List ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="overflow-x-auto">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-3xl bg-muted/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {users.map((user, i) => {
              const roleConf = ROLE_CONFIG[user.role];
              const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl border bg-card hover:shadow-sm transition-all group",
                    !user.isActive ? "opacity-55 border-border/30" : "border-border/50"
                  )}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0">
                    {initials}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  {/* Role selector */}
                  <div className="relative hidden sm:flex items-center shrink-0">
                    <select
                      value={user.role}
                      onChange={e => handleChangeRole(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className={cn("text-[11px] font-black px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 pr-6", roleConf.bg, roleConf.color, roleConf.border)}
                    >
                      <option value="STUDENT">Estudante</option>
                      <option value="COUNSELOR">Conselheiro</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 h-2.5 w-2.5 pointer-events-none opacity-50" />
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                      <BookHeart className="h-3 w-3 text-indigo-400" />
                      <span className="font-black text-foreground">{user._count.moodRecords}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                      <Brain className="h-3 w-3 text-violet-400" />
                      <span className="font-black text-foreground">{user._count.assessments}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="hidden lg:block text-[11px] text-muted-foreground font-medium shrink-0 w-20 text-right tabular-nums">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </span>

                  {/* Status toggle */}
                  <button
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    disabled={updatingId === user.id}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-colors shrink-0",
                      user.isActive
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800/30"
                        : "text-rose-700 bg-rose-50 border-rose-200/60 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800/30",
                    )}
                  >
                    {updatingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : user.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                    <span className="hidden sm:inline">{user.isActive ? "Ativo" : "Inativo"}</span>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/usuarios/${user.id}`}
                      title="Ver perfil"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      title="Excluir"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground font-medium">
            Página {page} de {totalPages} · {total} usuários
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-8 w-8 rounded-xl border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-8 w-8 rounded-xl border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

    </div>

    <ConfirmModal
      open={!!deleteTarget}
      title="Excluir conta"
      description={`Tem certeza que deseja excluir permanentemente a conta de ${deleteTarget?.name}? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      loading={deleting}
      onClose={() => setDeleteTarget(null)}
      onConfirm={confirmDelete}
    />
    </>
  );
}