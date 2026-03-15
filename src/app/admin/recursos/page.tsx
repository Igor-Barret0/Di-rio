"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Plus, Phone, Globe, Pencil, Trash2,
  Check, X, Loader2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/client";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface Resource {
  id: string; name: string; description: string;
  phone?: string | null; url?: string | null;
  type: "crise" | "apoio" | "informacao"; isActive: boolean;
}

type NewResource = Omit<Resource, "id" | "isActive">;

const TYPE_CONFIG = {
  crise:      { label: "Crise",      emoji: "🚨", gradient: "from-rose-500 to-red-600",      light: "bg-rose-50 dark:bg-rose-950/30",      border: "border-rose-200/60 dark:border-rose-800/30",      text: "text-rose-700 dark:text-rose-400" },
  apoio:      { label: "Apoio",      emoji: "🤝", gradient: "from-violet-500 to-purple-600", light: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200/60 dark:border-violet-800/30",  text: "text-violet-700 dark:text-violet-400" },
  informacao: { label: "Informação", emoji: "📚", gradient: "from-blue-500 to-indigo-600",   light: "bg-blue-50 dark:bg-blue-950/30",      border: "border-blue-200/60 dark:border-blue-800/30",      text: "text-blue-700 dark:text-blue-400" },
};

const EMPTY: NewResource = { name: "", description: "", type: "apoio", phone: "", url: "" };

/* ─── Form ───────────────────────────────────────────────────── */
function ResourceForm({ initial, onSave, onCancel, saving }: {
  initial: NewResource; onSave: (d: NewResource) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = React.useState<NewResource>(initial);
  const set = (k: keyof NewResource, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.description.trim();

  return (
    <div className="p-5 space-y-4 bg-muted/20 rounded-2xl border border-border/40">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nome *</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: CVV" className="h-9 rounded-xl text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tipo *</label>
          <div className="relative">
            <select
              value={form.type}
              onChange={e => set("type", e.target.value)}
              className="w-full h-9 rounded-xl border border-border/60 bg-card px-3 pr-8 text-sm font-semibold text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="apoio">🤝 Apoio</option>
              <option value="crise">🚨 Crise</option>
              <option value="informacao">📚 Informação</option>
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Descrição *</label>
        <textarea
          value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Breve descrição do recurso…"
          rows={2}
          className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Telefone</label>
          <Input value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} placeholder="Ex: 188" className="h-9 rounded-xl text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">URL</label>
          <Input value={form.url ?? ""} onChange={e => set("url", e.target.value)} placeholder="https://…" className="h-9 rounded-xl text-sm" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/30">
        <button onClick={onCancel} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <X className="h-3.5 w-3.5" /> Cancelar
        </button>
        <button
          onClick={() => valid && onSave(form)}
          disabled={!valid || saving}
          className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Salvar
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function AdminRecursosPage() {
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Resource | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    apiFetch<Resource[]>("/admin/resources").then(setResources).catch(() => toast.error("Erro ao carregar.")).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: NewResource) => {
    setSaving(true);
    try {
      const created = await apiFetch<Resource>("/admin/resources", { method: "POST", body: JSON.stringify(data) });
      setResources(prev => [created, ...prev]); setShowAdd(false); toast.success("Recurso criado.");
    } catch { toast.error("Erro ao criar."); } finally { setSaving(false); }
  };

  const handleUpdate = async (id: string, data: NewResource) => {
    setSaving(true);
    try {
      const updated = await apiFetch<Resource>(`/admin/resources/${id}`, { method: "PATCH", body: JSON.stringify(data) });
      setResources(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r)); setEditingId(null); toast.success("Atualizado.");
    } catch { toast.error("Erro ao atualizar."); } finally { setSaving(false); }
  };

  const handleToggle = async (r: Resource) => {
    setTogglingId(r.id);
    try {
      await apiFetch(`/admin/resources/${r.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !r.isActive }) });
      setResources(prev => prev.map(x => x.id === r.id ? { ...x, isActive: !r.isActive } : x));
    } catch { toast.error("Erro ao atualizar status."); } finally { setTogglingId(null); }
  };

  const handleDelete = (r: Resource) => setDeleteTarget(r);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/admin/resources/${deleteTarget.id}`, { method: "DELETE" });
      setResources(prev => prev.filter(x => x.id !== deleteTarget.id));
      toast.success("Excluído.");
      setDeleteTarget(null);
    } catch { toast.error("Erro ao excluir."); }
    finally { setDeleting(false); }
  };

  const grouped = React.useMemo(() => {
    const map: Record<string, Resource[]> = { crise: [], apoio: [], informacao: [] };
    for (const r of resources) (map[r.type] ??= []).push(r);
    return map;
  }, [resources]);

  return (
    <div className="space-y-6 pb-14">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Recursos</h1>
            <p className="text-xs text-muted-foreground font-medium">{resources.length} cadastrados</p>
          </div>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); }}
          disabled={showAdd}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-bold text-white bg-linear-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" /> Novo Recurso
        </button>
      </motion.div>

      {/* ── Add form ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-800/30 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-black text-foreground">Novo recurso</h2>
              </div>
              <ResourceForm initial={EMPTY} onSave={handleCreate} onCancel={() => setShowAdd(false)} saving={saving} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lists ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_,i) => <div key={i} className="h-20 rounded-2xl bg-muted/20 animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-3xl bg-muted/30 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Nenhum recurso cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(["crise", "apoio", "informacao"] as const).map(type => {
            const list = grouped[type] ?? [];
            if (list.length === 0) return null;
            const tc = TYPE_CONFIG[type];
            return (
              <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {/* Section header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={cn("w-7 h-7 rounded-lg bg-linear-to-br flex items-center justify-center shadow-sm text-base", tc.gradient)}>
                    {tc.emoji}
                  </div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest">{tc.label}</h2>
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", tc.light, tc.text, tc.border)}>
                    {list.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {list.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      {editingId === r.id ? (
                        <div className="rounded-2xl border border-border/50 bg-card p-4">
                          <ResourceForm
                            initial={{ name: r.name, description: r.description, type: r.type, phone: r.phone ?? "", url: r.url ?? "" }}
                            onSave={data => handleUpdate(r.id, data)}
                            onCancel={() => setEditingId(null)}
                            saving={saving}
                          />
                        </div>
                      ) : (
                        <div className={cn(
                          "flex items-start gap-4 p-4 rounded-2xl border bg-card transition-all hover:shadow-sm",
                          !r.isActive ? "opacity-50 border-border/30" : "border-border/50",
                        )}>
                          {/* Icon */}
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border", tc.light, tc.border)}>
                            {tc.emoji}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black text-foreground">{r.name}</p>
                              {!r.isActive && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground uppercase tracking-wider">Inativo</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.description}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {r.phone && (
                                <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                                  <Phone className="h-3 w-3" /> {r.phone}
                                </a>
                              )}
                              {r.url && (
                                <a href={r.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                  <Globe className="h-3 w-3" /> {r.url.replace(/^https?:\/\//, "").split("/")[0]}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggle(r)}
                              disabled={togglingId === r.id}
                              title={r.isActive ? "Desativar" : "Ativar"}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                              {togglingId === r.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : r.isActive
                                  ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                                  : <ToggleLeft className="h-4 w-4" />
                              }
                            </button>
                            <button
                              onClick={() => { setEditingId(r.id); setShowAdd(false); }}
                              title="Editar"
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              title="Excluir"
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir recurso"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}