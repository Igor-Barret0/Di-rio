"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { apiFetch, ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status >= 500) {
        setError("Serviço temporariamente indisponível. Tente novamente.");
      } else {
        setSent(true); // evita enumeração de e-mails
      }
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
        <div className="absolute top-[40%] left-[25%] w-50 h-50 rounded-full bg-fuchsia-500/10 blur-2xl" />

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

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-6">
            {/* Ícone grande decorativo */}
            <div className="w-20 h-20 rounded-3xl bg-white/8 border border-white/12 flex items-center justify-center">
              <Mail className="w-9 h-9 text-indigo-200" />
            </div>

            <div>
              <h1 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
                Redefinição{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-violet-300">
                  segura
                </span>{" "}
                de senha.
              </h1>
              <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-xs">
                Enviaremos um link único e temporário para o seu e-mail. O link expira em 1 hora por segurança.
              </p>
            </div>

            {/* Passos */}
            <div className="space-y-3 pt-2">
              {[
                { step: "1", text: "Informe o e-mail da sua conta" },
                { step: "2", text: "Receba o link de redefinição" },
                { step: "3", text: "Crie uma nova senha segura" },
              ].map(({ step, text }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                    <span className="text-indigo-200 text-xs font-black">{step}</span>
                  </div>
                  <p className="text-white/55 text-sm">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
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
          {/* Logo mobile */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Estado: e-mail enviado ────────────────── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-10 text-center"
              >
                {/* Ícone de sucesso animado */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-emerald-400/20"
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
                  Verifique seu e-mail
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  Enviamos um link de redefinição para
                </p>
                <p className="font-bold text-gray-800 text-sm mb-6 px-4 py-2 rounded-xl bg-gray-100 inline-block">
                  {email}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-left">
                    <span className="text-lg leading-none mt-0.5">📬</span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Não recebeu? Verifique a <span className="font-bold">pasta de spam</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-left">
                    <span className="text-lg leading-none mt-0.5">⏱️</span>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      O link é válido por <span className="font-bold">1 hora</span>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-5 underline underline-offset-4"
                >
                  Não recebi — tentar novamente
                </button>

                <Link
                  href="/login"
                  className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </motion.div>
            ) : (
              /* ── Estado: formulário ────────────────────── */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-9"
              >
                {/* Header */}
                <div className="mb-7 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">Esqueceu a senha?</h2>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Digite o e-mail da sua conta e enviaremos um link para redefinir sua senha.
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
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="email"
                        type="email"
                        placeholder="voce@escola.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar link de redefinição
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Info expiração */}
                <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Por segurança, o link expira em <span className="font-bold text-gray-700">1 hora</span>.
                  </p>
                </div>

                {/* Voltar */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar para o login
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