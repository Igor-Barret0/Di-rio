"use client";

import * as React from "react";
import Link from "next/link";

import { motion } from "framer-motion";
import {
  Shield, TrendingUp, Users, BookOpen,
  ArrowRight, Sparkles, Eye, EyeOff,
  Mail, Lock, CheckCircle2, Flame,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { apiFetch, saveTokens, ApiError } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const features = [
  { icon: BookOpen,   title: "Registro Diário",      desc: "Acompanhe seu estado emocional com facilidade", color: "bg-indigo-500/20 border-indigo-400/20", iconColor: "text-indigo-300" },
  { icon: TrendingUp, title: "Insights Inteligentes", desc: "Visualize padrões e evolua seu bem-estar",       color: "bg-violet-500/20 border-violet-400/20", iconColor: "text-violet-300" },
  { icon: Shield,     title: "100% Privado",          desc: "Seus dados são protegidos e seguros",            color: "bg-emerald-500/20 border-emerald-400/20", iconColor: "text-emerald-300" },
  { icon: Users,      title: "Suporte Escolar",       desc: "Conectado à rede de apoio da sua escola",        color: "bg-rose-500/20 border-rose-400/20",       iconColor: "text-rose-300"    },
];

const stats = [
  { value: "2.4k+", label: "Estudantes", icon: Users },
  { value: "98%",   label: "Satisfação",  icon: TrendingUp },
  { value: "150+",  label: "Escolas",     icon: Shield },
];


const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered") === "1";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch<{ accessToken: string; refreshToken: string; user: { role: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email: email.trim(), password }) },
      );
      saveTokens(result);
      window.location.href = result.user?.role === "ADMIN" ? "/admin" : "/dashboard";
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401
        ? "Email ou senha incorretos."
        : "Não foi possível conectar ao servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9ff]">

      {/* ── Painel Esquerdo — Branding ───────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#08061a] via-[#130c3a] to-[#0c1540]" />

        {/* Orbs */}
        <div className="absolute -top-40 -right-20 w-120 h-120 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-95 h-95 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-[45%] left-[30%] w-55 h-55 rounded-full bg-fuchsia-500/12 blur-2xl" />

        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />


        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Logo className="brightness-0 invert" small />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-7"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="text-white/70 text-[11px] font-semibold tracking-wider uppercase">Plataforma de bem-estar escolar</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-[2.6rem] font-black text-white leading-[1.08] tracking-tight">
                Cuide da sua{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-violet-300 to-fuchsia-300">
                  saúde emocional
                </span>
                <br />com consciência.
              </h1>
              <p className="mt-4 text-white/45 text-sm leading-relaxed max-w-sm">
                Um espaço seguro para estudantes registrarem, entenderem e evoluírem sua saúde emocional.
              </p>
            </div>

            {/* Weekly progress preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/6 border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">Progresso semanal</p>
                  <p className="text-white/40 text-[11px] mt-0.5">Bem-estar em evolução</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/25 rounded-full px-3 py-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-bold">+12%</span>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end gap-1.5 h-14">
                {[
                  { h: "40%", active: false },
                  { h: "60%", active: false },
                  { h: "45%", active: false },
                  { h: "75%", active: false },
                  { h: "65%", active: false },
                  { h: "85%", active: false },
                  { h: "92%", active: true  },
                ].map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md ${b.active ? "bg-indigo-400" : "bg-white/20"}`}
                      style={{ height: b.h }}
                    />
                    <span className="text-white/25 text-[9px] font-semibold">
                      {["S","T","Q","Q","S","S","D"][i]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-linear-to-r from-indigo-400 to-violet-500" />
                </div>
                <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-white/40 text-[10px] font-semibold shrink-0">5 dias seguidos</span>
              </div>
            </motion.div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {features.map(({ icon: Icon, title, desc, color, iconColor }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.55 + i * 0.07 }}
                  className={`flex gap-2.5 p-3 rounded-xl border ${color} hover:brightness-110 transition-all`}
                >
                  <div className="shrink-0 mt-0.5">
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-bold leading-tight">{title}</p>
                    <p className="text-white/35 text-[10px] mt-0.5 leading-snug">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center gap-8"
          >
            {stats.map((s, i) => (
              <React.Fragment key={s.value}>
                {i > 0 && <div className="w-px h-8 bg-white/10" />}
                <div className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-white font-black text-xl tracking-tight leading-none">{s.value}</p>
                    <p className="text-white/35 text-[10px] mt-0.5 font-semibold">{s.label}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Painel Direito — Formulário ──────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-hidden">

        {/* Background decorativo */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/80 via-[#f8f9ff] to-violet-50/60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Logo mobile */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          {/* Card do formulário */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-7">

            {/* Header */}
            <div className="mb-5">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Bem-vindo de volta</h2>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                Entre para continuar seu acompanhamento emocional.
              </p>
            </div>

            {/* Alertas */}
            {registered && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-700">Conta criada! Faça login para continuar.</p>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Formulário */}
            <form onSubmit={onSubmit} className="space-y-4">

              {/* Email */}
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

              {/* Senha */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Senha
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Esqueci a senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
              </div>

              {/* Botão submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-11 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-bold tracking-wide shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar na plataforma
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api"}/auth/google`}
              className="flex w-full h-11 items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <GoogleIcon />
              Continuar com Google
            </a>

            {/* Privacidade */}
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-600" />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Ambiente <span className="font-semibold text-gray-700">seguro e privado</span>. Seus registros nunca são compartilhados sem sua autorização.
              </p>
            </div>

            {/* Rodapé */}
            <div className="mt-4 text-center space-y-1.5">
              <p className="text-sm text-gray-500">
                Não tem conta?{" "}
                <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Criar conta
                </Link>
              </p>
              <p className="text-xs text-gray-400">
                Em caso de urgência,{" "}
                <Link href="#" className="font-semibold text-indigo-500 hover:underline">
                  acesse o suporte escolar
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}