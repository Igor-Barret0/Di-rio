"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdviceCard } from "@/components/shared/AdviceCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import { countConsecutiveLowMood } from "@/lib/storage/moodStorage";
import { motion } from "framer-motion";
import { Sparkles, Lightbulb, PlayCircle, HeartPulse, ShieldAlert, ArrowRight, Video, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const VIDEOS = {
  breathing: {
    id: "dbCNSFYRUMU",
    title: "Exercício de Respiração 4-7-8",
  },
  anxiety: {
    id: "4DpFox98kyg",
    title: "Entendendo a Ansiedade",
  },
};

const FRASES_DO_DIA = [
  { texto: "Você não é seus pensamentos. Você é a pessoa que os observa.", tema: "Auto-compaixão" },
  { texto: "Cada dia é uma nova chance de crescer e se reconectar com quem você realmente é.", tema: "Crescimento" },
  { texto: "Sentir é humano. Cuidar de si mesmo é sabedoria.", tema: "Autocuidado" },
  { texto: "A coragem não é a ausência do medo, mas a decisão de que algo é mais importante que ele.", tema: "Coragem" },
  { texto: "Você merece o mesmo cuidado e carinho que oferece às pessoas que ama.", tema: "Auto-compaixão" },
  { texto: "Pequenos progressos ainda são progressos. Cada passo conta.", tema: "Progresso" },
  { texto: "Não é fraqueza pedir ajuda. É inteligência emocional.", tema: "Força" },
  { texto: "Sua mente é um jardim — você escolhe o que plantar nela.", tema: "Mentalidade" },
  { texto: "Respire fundo. Esse momento também vai passar.", tema: "Calma" },
  { texto: "Você é capaz de mais do que imagina nos dias difíceis.", tema: "Resiliência" },
  { texto: "Gentileza começa de dentro para fora.", tema: "Gentileza" },
  { texto: "Suas emoções são mensagens, não sentenças.", tema: "Autoconsciência" },
  { texto: "Está bem não estar bem. O que importa é não desistir.", tema: "Aceitação" },
  { texto: "O descanso é parte produtiva do seu dia — não uma recompensa.", tema: "Equilíbrio" },
  { texto: "Cada emoção que você nomeia perde um pouco do poder que tem sobre você.", tema: "Autoconsciência" },
  { texto: "Você não precisa ser perfeito para ser suficiente.", tema: "Auto-compaixão" },
  { texto: "A presença no momento presente é o maior presente que você pode dar a si mesmo.", tema: "Mindfulness" },
  { texto: "Cuidar da saúde mental é tão importante quanto cuidar da saúde física.", tema: "Saúde" },
  { texto: "Errar faz parte do aprendizado. Recomeçar é um ato de bravura.", tema: "Crescimento" },
  { texto: "Você não precisa resolver tudo hoje. Um passo de cada vez basta.", tema: "Calma" },
  { texto: "Sua história não acabou. Você ainda está escrevendo os melhores capítulos.", tema: "Esperança" },
  { texto: "Fale consigo mesmo com a mesma bondade que fala com um bom amigo.", tema: "Auto-compaixão" },
  { texto: "A gratidão não apaga os problemas, mas muda a perspectiva com que os vemos.", tema: "Gratidão" },
  { texto: "Você é mais forte do que a tempestade que está enfrentando agora.", tema: "Resiliência" },
  { texto: "Pedir ajuda é um sinal de autoconhecimento, não de fraqueza.", tema: "Coragem" },
  { texto: "Suas conquistas merecem ser celebradas, mesmo as pequenas.", tema: "Autoestima" },
  { texto: "O que você sente é válido. Suas emoções importam.", tema: "Aceitação" },
  { texto: "Pausar não é desistir. É se preparar para continuar com mais clareza.", tema: "Equilíbrio" },
  { texto: "Você tem o direito de mudar, de crescer e de ser diferente de quem era antes.", tema: "Crescimento" },
  { texto: "A paz interior começa quando você para de lutar contra o que não pode controlar.", tema: "Aceitação" },
  { texto: "Cada novo dia é uma oportunidade de cuidar melhor de si mesmo.", tema: "Autocuidado" },
];

function getFraseDodia() {
  const hoje = new Date();
  const indice = (hoje.getFullYear() * 365 + hoje.getMonth() * 31 + hoje.getDate()) % FRASES_DO_DIA.length;
  return FRASES_DO_DIA[indice];
}

export default function InsightsPage() {
  const { records, loading } = useMoodRecords();
  const fraseHoje = getFraseDodia();
  const [activeVideo, setActiveVideo] = React.useState<keyof typeof VIDEOS | null>(null);

  const consecutiveLow = React.useMemo(() => {
    return countConsecutiveLowMood(records);
  }, [records]);

  const shouldShowEmergency = consecutiveLow >= 3;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10 pb-12"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-secondary/10 text-secondary shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#0F172A]">Insights & Apoio</h1>
          </div>
          <p className="text-lg font-semibold text-[#475569]/80 max-w-2xl">
            Sugestões personalizadas baseadas no seu histórico para fortalecer sua saúde mental.
          </p>
        </motion.div>

        {shouldShowEmergency && (
          <motion.div variants={itemVariants}>
            <Card className="border-none bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] ring-1 ring-rose-500/20 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 bg-rose-500/10 h-40 w-40 rounded-full blur-3xl" />
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="h-20 w-20 rounded-3xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 shrink-0">
                  <ShieldAlert className="h-10 w-10" />
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <h2 className="text-2xl font-black text-rose-900 dark:text-rose-100 tracking-tight">Estamos aqui para você.</h2>
                  <p className="text-rose-700/80 dark:text-rose-300/80 font-bold leading-relaxed max-w-xl">
                    Percebemos que os últimos dias têm sido difíceis. Lembre-se que você não precisa carregar tudo sozinho. Que tal conversar com um orientador da escola?
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs uppercase tracking-widest px-8">Procurar Apoio Agora</Button>
                    <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100 rounded-full font-black text-xs uppercase tracking-widest px-8">Mais Tarde</Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Card className="h-full border-none bg-white p-8 rounded-[2.5rem] shadow-premium hover:shadow-premium-hover transition-all ring-1 ring-black/2">
              <div className="flex flex-col h-full space-y-6">
                <div className="h-16 w-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:bg-amber-100 transition-colors">
                  <Lightbulb className="h-8 w-8" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Exercício de Respiração</h3>
                  <p className="text-sm font-bold text-[#475569]/80 leading-relaxed">
                    Técnica 4-7-8: inspire por 4s, segure por 7s e solte por 8s. Ajuda a acalmar o sistema nervoso instantaneamente.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveVideo("breathing")}
                  className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest py-6"
                >
                  Assistir Agora <PlayCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Card className="h-full border-none bg-white p-8 rounded-[2.5rem] shadow-premium hover:shadow-premium-hover transition-all ring-1 ring-black/2">
              <div className="flex flex-col h-full space-y-6">
                <div className="h-16 w-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:bg-indigo-100 transition-colors">
                  <Video className="h-8 w-8" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Vídeo Educativo</h3>
                  <p className="text-sm font-bold text-[#475569]/80 leading-relaxed">
                    Entenda como a ansiedade funciona no cérebro e aprenda estratégias práticas para lidar com ela no dia a dia.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveVideo("anxiety")}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest py-6"
                >
                  Assistir Vídeo <PlayCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Card className="h-full border-none bg-white p-8 rounded-[2.5rem] shadow-premium hover:shadow-premium-hover transition-all ring-1 ring-black/2">
              <div className="flex flex-col h-full space-y-6">
                <div className="h-16 w-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner group-hover:bg-rose-100 transition-colors">
                  <HeartPulse className="h-8 w-8" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Frase do Dia</h3>
                  <p className="text-lg font-bold text-[#475569]/90 italic leading-relaxed pt-2">
                    "{fraseHoje.texto}"
                  </p>
                </div>
                <div className="pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">{fraseHoje.tema}</div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="border-none bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="absolute bottom-0 right-0 -mb-20 -mr-20 bg-primary/20 h-64 w-64 rounded-full blur-3xl opacity-50" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 text-white">
              <div className="space-y-4 max-w-xl text-center md:text-left">
                <h3 className="text-3xl font-black tracking-tight">Quer aprofundar seu autoconhecimento?</h3>
                <p className="text-white/70 font-semibold text-lg leading-relaxed">
                  Nossos guias completos ajudam você a entender melhor suas emoções e construir hábitos saudáveis.
                </p>
              </div>
              <Button onClick={() => window.open("https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-mental", "_blank")} className="bg-white text-[#0F172A] hover:bg-white/90 rounded-full font-black text-sm uppercase tracking-[0.15em] px-10 h-14 shadow-xl shadow-white/10 shrink-0 transition-transform active:scale-95">Guia de Saúde Mental</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {activeVideo && (
        <Dialog open={true} onOpenChange={() => setActiveVideo(null)}>
          <DialogContent
            showCloseButton={false}
            className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border-none shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3 bg-[#0F172A]">
              <span className="text-sm font-bold text-white">{VIDEOS[activeVideo].title}</span>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${VIDEOS[activeVideo].id}?autoplay=1&rel=0`}
                title={VIDEOS[activeVideo].title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
