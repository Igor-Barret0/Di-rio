"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  BookHeart,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const features = [
  {
    icon: BookHeart,
    title: "Registro Diário",
    desc: "Acompanhe seu estado emocional com facilidade",
  },
  {
    icon: TrendingUp,
    title: "Insights Inteligentes",
    desc: "Visualize padrões e evolua seu bem-estar",
  },
  {
    icon: Shield,
    title: "100% Privado",
    desc: "Seus dados são protegidos e seguros",
  },
  {
    icon: Users,
    title: "Suporte Escolar",
    desc: "Conectado à rede de apoio da sua escola",
  },
];

const stats = [
  { value: "2.4k+", label: "Estudantes ativos" },
  { value: "98%", label: "Satisfação" },
  { value: "150+", label: "Escolas parceiras" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ─── Painel Esquerdo — Branding ───────────────── */}
      <div className="hidden lg:flex lg:w-[56%] relative overflow-hidden">
        {/* Fundo gradiente escuro */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-950 via-[#1e1065] to-indigo-900" />

        {/* Orbs decorativos */}
        <div className="orb w-130 h-130 bg-violet-600/25 -top-30 -right-20" />
        <div className="orb w-95 h-95 bg-indigo-400/20 -bottom-15 -left-15" />
        <div className="orb w-50 h-50 bg-fuchsia-500/15 top-[40%] left-[30%]" />

        {/* Grid decorativo sutil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Logo className="brightness-0 invert" />
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="space-y-7"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 px-4 py-2 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white/75 text-xs font-medium">
                Plataforma de bem-estar escolar
              </span>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                Cuide da sua{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-violet-300">
                  saúde emocional
                </span>{" "}
                com consciência.
              </h1>
              <p className="mt-4 text-white/55 text-base leading-relaxed max-w-sm">
                Uma plataforma segura onde estudantes registram, acompanham e compreendem suas emoções no dia a dia escolar.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className="flex gap-3 p-3.5 rounded-2xl bg-white/6 border border-white/9 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-400/20 flex items-center justify-center shrink-0 border border-indigo-300/20">
                    <Icon className="w-4 h-4 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold leading-snug">{title}</p>
                    <p className="text-white/45 text-[11px] mt-0.5 leading-snug">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-8"
          >
            {stats.map((s, i) => (
              <React.Fragment key={s.value}>
                {i > 0 && <div className="w-px h-9 bg-white/15" />}
                <div>
                  <p className="text-white font-extrabold text-2xl tracking-tight">{s.value}</p>
                  <p className="text-white/45 text-[11px] mt-0.5 font-medium">{s.label}</p>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── Painel Direito — Formulário ──────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 relative overflow-hidden">
        {/* Fundo sutil */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 via-background to-violet-50/30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-100"
        >
          {/* Logo mobile */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 lg:hidden"
          >
            <Logo />
          </motion.div>

          {/* Cabeçalho do form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Bem-vindo de volta
            </h2>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Entre para continuar seu acompanhamento emocional.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email institucional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@escola.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-sm rounded-xl border-border focus:border-primary transition-colors"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Senha
                </Label>
                <Link
                  href="#"
                  className="text-xs font-medium text-primary hover:underline underline-offset-4 transition-all"
                >
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-sm rounded-xl pr-11 border-border focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold rounded-xl text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar na plataforma
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Badge de segurança */}
          <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-muted/60 border border-border/60 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ambiente <span className="font-semibold text-foreground">seguro e privado</span>. Seus registros emocionais nunca são compartilhados sem sua autorização explícita.
            </p>
          </div>

          {/* Rodapé */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Em caso de urgência emocional,{" "}
              <Link
                href="#"
                className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
              >
                acesse o suporte escolar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
