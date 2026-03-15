"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { apiFetch, ApiError } from "@/lib/api/client";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const colors = ["", "bg-rose-400", "bg-amber-400", "bg-lime-400", "bg-emerald-500"];
  const textColors = ["", "text-rose-500", "text-amber-500", "text-lime-600", "text-emerald-600"];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${textColors[score]}`}>Senha {labels[score]}</p>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const invalidLink = !token;
  const passwordsMatch = confirm === "" || password === confirm;

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 3500);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? "Este link é inválido ou já expirou. Solicite um novo."
          : "Serviço temporariamente indisponível. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9ff]">

      {/* ── Painel esquerdo — decorativo ───────────────── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#0f0a2e] via-[#1a0f4e] to-[#0d1b4b]" />
        <div className="absolute -top-32 -right-24 w-130 h-130 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-95 h-95 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-[38%] left-[28%] w-50 h-50 rounded-full bg-fuchsia-500/10 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Logo className="brightness-0 invert" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-7">
            <div className="w-20 h-20 rounded-3xl bg-white/8 border border-white/12 flex items-center justify-center">
              <KeyRound className="w-9 h-9 text-indigo-200" />
            </div>

            <div>
              <h1 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
                Crie uma senha{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-violet-300">
                  forte e segura.
                </span>
              </h1>
              <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-xs">
                Escolha uma senha que você não use em outros lugares para manter sua conta protegida.
              </p>
            </div>

            {/* Dicas de senha */}
            <div className="space-y-2.5 pt-1">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Boas práticas</p>
              {[
                { icon: "🔤", text: "Mínimo de 8 caracteres" },
                { icon: "🔢", text: "Inclua números e letras maiúsculas" },
                { icon: "✨", text: "Adicione símbolos especiais (!@#$)" },
                { icon: "🔒", text: "Não reutilize senhas de outros sites" },
              ].map(({ icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-base leading-none">{icon}</span>
                  <p className="text-white/50 text-sm">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <p className="text-white/30 text-xs">
              Lembrou a senha?{" "}
              <Link href="/login" className="text-indigo-300 font-semibold hover:text-white transition-colors">
                Fazer login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Painel direito — formulário ─────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/80 via-[#f8f9ff] to-violet-50/60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          <AnimatePresence mode="wait">

            {/* ── Link inválido ─────────────────────────── */}
            {invalidLink ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-10 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Link inválido</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Este link é inválido ou está incompleto. Solicite um novo link de redefinição.
                </p>
                <Link
                  href="/forgot-password"
                  className="flex w-full h-11 items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 mb-4 transition-all hover:from-indigo-700 hover:to-violet-700"
                >
                  Solicitar novo link
                </Link>
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
                </Link>
              </motion.div>

            ) : success ? (
              /* ── Sucesso ──────────────────────────────── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-10 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-emerald-400/20"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Senha redefinida!</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Sua senha foi alterada com sucesso. Você será redirecionado para o login automaticamente.
                </p>
                <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-400 font-medium">
                  <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-indigo-500 animate-spin" />
                  Redirecionando em instantes...
                </div>
                <Link
                  href="/login"
                  className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Ir para o login agora
                </Link>
              </motion.div>

            ) : (
              /* ── Formulário ───────────────────────────── */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-9"
              >
                {/* Header */}
                <div className="mb-7 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
                    <KeyRound className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">Criar nova senha</h2>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Escolha uma senha forte com pelo menos 8 caracteres.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">

                  {/* Nova senha */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Nova senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-11 pl-10 pr-11 text-sm rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  {/* Confirmar senha */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirm" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Confirmar nova senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repita a nova senha"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        className={`w-full h-11 pl-10 pr-11 text-sm rounded-xl border bg-gray-50/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          passwordsMatch
                            ? "border-gray-200 focus:ring-indigo-500/30 focus:border-indigo-400"
                            : "border-rose-300 focus:ring-rose-500/20 focus:border-rose-400"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!passwordsMatch && (
                      <p className="text-[11px] text-rose-500 font-semibold">As senhas não coincidem</p>
                    )}
                  </div>

                  {/* Botão */}
                  <button
                    type="submit"
                    disabled={loading || !passwordsMatch}
                    className="mt-2 w-full h-11 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Salvar nova senha
                      </>
                    )}
                  </button>
                </form>

                {/* Voltar */}
                <div className="mt-6 text-center">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}