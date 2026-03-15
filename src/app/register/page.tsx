"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookHeart, Shield, TrendingUp, Users,
  ArrowRight, Sparkles, Eye, EyeOff,
  Mail, Lock, User,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { apiFetch, ApiError } from "@/lib/api/client";

const features = [
  { icon: BookHeart, title: "Registro Diário", desc: "Acompanhe seu estado emocional com facilidade" },
  { icon: TrendingUp, title: "Insights Inteligentes", desc: "Visualize padrões e evolua seu bem-estar" },
  { icon: Shield, title: "100% Privado", desc: "Seus dados são protegidos e seguros" },
  { icon: Users, title: "Suporte Escolar", desc: "Conectado à rede de apoio da sua escola" },
];

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

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

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${score <= 1 ? "text-rose-500" : score === 2 ? "text-amber-500" : score === 3 ? "text-lime-600" : "text-emerald-600"}`}>
        Senha {labels[score]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const passwordsMatch = confirmPassword === "" || password === confirmPassword;

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }
    if (password.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return; }
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: nome.trim(), email: email.trim(), password }),
      });
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9ff]">

      {/* ── Painel Esquerdo — Branding ───────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#0f0a2e] via-[#1a0f4e] to-[#0d1b4b]" />

        <div className="absolute -top-32 -right-24 w-130 h-130 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-95 h-95 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-[40%] left-[35%] w-50 h-50 rounded-full bg-fuchsia-500/10 blur-2xl" />

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

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white/70 text-xs font-medium tracking-wide">Plataforma de bem-estar escolar</span>
            </div>

            <div>
              <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Comece sua jornada de{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-violet-300 to-fuchsia-300">
                  bem-estar emocional.
                </span>
              </h1>
              <p className="mt-5 text-white/50 text-base leading-relaxed max-w-xs">
                Crie sua conta e comece a registrar, acompanhar e compreender suas emoções no dia a dia escolar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.07 }}
                  className="flex gap-3 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/9 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-400/15 border border-indigo-300/15 flex items-center justify-center shrink-0 group-hover:bg-indigo-400/25 transition-colors">
                    <Icon className="w-4 h-4 text-indigo-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold leading-tight">{title}</p>
                    <p className="text-white/50 text-[11px] mt-1 leading-snug">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.75 }}>
            <p className="text-white/30 text-xs">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-indigo-300 font-semibold hover:text-white transition-colors">
                Fazer login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Painel Direito — Formulário ──────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-hidden">

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

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-900/8 px-8 py-7">

            {/* Header */}
            <div className="mb-5">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Criar conta</h2>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                Preencha os dados abaixo para começar.
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

              {/* Nome */}
              <div className="space-y-1.5">
                <label htmlFor="nome" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="nome"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Senha
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
                <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                className="mt-2 w-full h-11 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-bold tracking-wide shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta
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
              Registrar com Google
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
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Já tem uma conta?{" "}
                <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}