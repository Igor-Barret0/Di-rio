"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/lib/api/client";
import { useMoodRecords } from "@/hooks/useMoodRecords";
import { computePredictiveInsight } from "@/lib/analytics/predictive";
import { PredictiveInsightBanner } from "@/components/shared/PredictiveInsightBanner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, PlayCircle, ShieldAlert, Wind, Brain, HandHeart,
  RefreshCw, X, Moon, Heart, Leaf, ChevronDown, ExternalLink, Phone,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ─── Frases do Dia ─────────────────────────────────────────────────────────── */
const FRASES = [
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

/* ─── Técnicas de mindfulness ────────────────────────────────────────────────── */
const TECNICAS = [
  {
    id: "respiracao478",
    emoji: "🌬️",
    titulo: "Respiração 4-7-8",
    descricao: "Inspire por 4s, segure por 7s, solte por 8s. Acalma o sistema nervoso em minutos.",
    passos: ["Sente-se confortável e feche os olhos.", "Inspire pelo nariz contando 4 segundos.", "Segure a respiração por 7 segundos.", "Solte lentamente pela boca em 8 segundos.", "Repita 4 vezes."],
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200/60 dark:border-amber-800/30",
    accent: "text-amber-600 dark:text-amber-400",
    stepColor: "text-amber-600",
    video: "dbCNSFYRUMU",
    icon: Wind,
  },
  {
    id: "grounding54321",
    emoji: "🌿",
    titulo: "Grounding 5-4-3-2-1",
    descricao: "Técnica de ancoragem para ansiedade: use os 5 sentidos para voltar ao presente.",
    passos: ["5 coisas que você pode VER ao redor.", "4 coisas que você pode TOCAR agora.", "3 coisas que você pode OUVIR.", "2 coisas que você pode CHEIRAR.", "1 coisa que você pode SABOREAR."],
    gradient: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200/60 dark:border-emerald-800/30",
    accent: "text-emerald-600 dark:text-emerald-400",
    stepColor: "text-emerald-600",
    video: "WslQPnj6RHs",
    icon: HandHeart,
  },
  {
    id: "respiracaocaixa",
    emoji: "⬜",
    titulo: "Respiração em Caixa",
    descricao: "Técnica usada por atletas e militares para controle rápido do estresse.",
    passos: ["Inspire contando 4 segundos.", "Segure por 4 segundos.", "Expire por 4 segundos.", "Segure por 4 segundos.", "Repita 4 ciclos."],
    gradient: "from-blue-500 to-indigo-500",
    lightBg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200/60 dark:border-blue-800/30",
    accent: "text-blue-600 dark:text-blue-400",
    stepColor: "text-blue-600",
    video: "kiEmbhvv7Fo",
    icon: Wind,
  },
  {
    id: "ansiedade",
    emoji: "🧠",
    titulo: "Entendendo a Ansiedade",
    descricao: "Como a ansiedade funciona no cérebro e estratégias práticas para lidar com ela.",
    passos: [],
    gradient: "from-violet-500 to-purple-500",
    lightBg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200/60 dark:border-violet-800/30",
    accent: "text-violet-600 dark:text-violet-400",
    stepColor: "text-violet-600",
    video: "4DpFox98kyg",
    icon: Brain,
  },
];

/* ─── Meditações guiadas ─────────────────────────────────────────────────────── */
const MEDITACOES = [
  {
    id: "varredura-corporal",
    emoji: "🌙",
    titulo: "Varredura Corporal",
    descricao: "Percorra mentalmente cada parte do corpo para liberar tensão e chegar ao relaxamento profundo.",
    passos: [
      "Deite-se confortavelmente e feche os olhos.",
      "Respire fundo três vezes, soltando todo o ar lentamente.",
      "Concentre sua atenção nos pés — observe qualquer sensação sem julgamento.",
      "Suba lentamente: panturrilhas, joelhos, coxas, abdômen.",
      "Continue: peito, ombros, braços, mãos.",
      "Por fim, pescoço, rosto e topo da cabeça.",
      "Permaneça em silêncio por algumas respirações antes de abrir os olhos.",
    ],
    gradient: "from-violet-500 to-indigo-500",
    lightBg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200/60 dark:border-violet-800/30",
    accent: "text-violet-600 dark:text-violet-400",
    stepColor: "text-violet-600",
    video: "S9p8j-QnICo",
    icon: Moon,
  },
  {
    id: "compaixao",
    emoji: "💜",
    titulo: "Meditação da Compaixão",
    descricao: "Cultive sentimentos de bondade e amor por si mesmo e pelas pessoas ao seu redor.",
    passos: [
      "Sente-se com a coluna ereta e respire naturalmente.",
      "Visualize a si mesmo e repita: 'Que eu seja feliz. Que eu esteja em paz.'",
      "Expanda o sentimento para alguém querido.",
      "Inclua pessoas neutras em sua vida.",
      "Por fim, expanda para todas as pessoas ao redor.",
      "Fique com essa sensação de calor por alguns minutos.",
    ],
    gradient: "from-pink-500 to-rose-500",
    lightBg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200/60 dark:border-pink-800/30",
    accent: "text-pink-600 dark:text-pink-400",
    stepColor: "text-pink-600",
    video: "zwc9rRB__Wo",
    icon: Heart,
  },
  {
    id: "5minutos",
    emoji: "🍃",
    titulo: "Meditação de 5 Minutos",
    descricao: "Uma pausa rápida para resetar a mente em qualquer momento do dia.",
    passos: [
      "Encontre uma posição confortável, sentado ou deitado.",
      "Feche os olhos e inspire profundamente pelo nariz.",
      "Observe a respiração: a entrada e saída do ar, o movimento do abdômen.",
      "Quando um pensamento surgir, observe-o sem julgamento e retorne à respiração.",
      "Continue por 5 minutos, sempre voltando ao foco na respiração.",
    ],
    gradient: "from-teal-500 to-emerald-500",
    lightBg: "bg-teal-50 dark:bg-teal-950/20",
    border: "border-teal-200/60 dark:border-teal-800/30",
    accent: "text-teal-600 dark:text-teal-400",
    stepColor: "text-teal-600",
    video: "fmBRuuQ0Gs8",
    icon: Leaf,
  },
  {
    id: "visualizacao",
    emoji: "🌅",
    titulo: "Meditação de Visualização",
    descricao: "Use a imaginação para criar um lugar seguro e tranquilo na sua mente.",
    passos: [
      "Feche os olhos e respire profundamente três vezes.",
      "Imagine um lugar que traz calma e segurança — real ou imaginário.",
      "Observe os detalhes: cores, sons, cheiros, temperatura.",
      "Sinta-se completamente seguro e em paz nesse lugar.",
      "Quando quiser sair, respire fundo e abra os olhos lentamente.",
      "Lembre-se: você pode voltar a esse lugar sempre que precisar.",
    ],
    gradient: "from-sky-500 to-blue-500",
    lightBg: "bg-sky-50 dark:bg-sky-950/20",
    border: "border-sky-200/60 dark:border-sky-800/30",
    accent: "text-sky-600 dark:text-sky-400",
    stepColor: "text-sky-600",
    video: "pRgzG9PGkHw",
    icon: Sparkles,
  },
];

/* ─── Dicas personalizadas por mood ──────────────────────────────────────────── */
const DICAS_POR_MOOD: Record<string, { titulo: string; dica: string; icon: string }[]> = {
  sad: [
    { titulo: "Movimento suave", dica: "Uma caminhada de 10 minutos pode elevar seu humor. Mesmo dentro de casa.", icon: "🚶" },
    { titulo: "Escreva 3 coisas", dica: "Anote 3 pequenas coisas pelas quais você é grato hoje, por menores que sejam.", icon: "📝" },
    { titulo: "Conecte-se", dica: "Mande uma mensagem para alguém de confiança. Você não precisa carregar isso sozinho.", icon: "💬" },
  ],
  anxious: [
    { titulo: "Técnica 4-7-8", dica: "Inspire 4s → segure 7s → solte 8s. Repita 4 vezes. Acalma o sistema nervoso em minutos.", icon: "🌬️" },
    { titulo: "Nomeie o sentimento", dica: "Dizer 'estou ansioso' em voz alta reduz a intensidade da emoção. É ciência.", icon: "🧠" },
    { titulo: "Grounding", dica: "Encontre 5 coisas que você pode ver agora. Isso traz você de volta ao presente.", icon: "🌿" },
  ],
  happy: [
    { titulo: "Aproveite o momentum", dica: "Dias bons são perfeitos para construir hábitos positivos. O que você quer cultivar?", icon: "🚀" },
    { titulo: "Compartilhe", dica: "Quando estamos bem, ajudar o próximo amplifica ainda mais nosso bem-estar.", icon: "🤝" },
    { titulo: "Registre o motivo", dica: "O que está fazendo você se sentir bem hoje? Anote — vai ajudar nos dias difíceis.", icon: "✍️" },
  ],
  neutral: [
    { titulo: "Pratique presença", dica: "Dias neutros são perfeitos para meditar. Sem extremos, só o momento presente.", icon: "🧘" },
    { titulo: "Explore uma emoção", dica: "Quando estamos neutros, é mais fácil observar nossos pensamentos sem julgamento.", icon: "🔍" },
    { titulo: "Pequena conquista", dica: "Faça UMA coisa hoje que seu eu do futuro vai agradecer.", icon: "⭐" },
  ],
};

const MOOD_LABELS: Record<string, { label: string; emoji: string; gradient: string }> = {
  sad:     { label: "Triste",   emoji: "😔", gradient: "from-violet-500 to-purple-500" },
  anxious: { label: "Ansioso",  emoji: "😰", gradient: "from-orange-500 to-amber-500" },
  happy:   { label: "Feliz",    emoji: "🙂", gradient: "from-emerald-500 to-teal-500" },
  neutral: { label: "Neutro",   emoji: "😐", gradient: "from-blue-500 to-indigo-500"  },
};

/* ─── Breathing Timer ────────────────────────────────────────────────────────── */
type Phase = "inspire" | "segure" | "solte" | "idle";

function BreathingTimer() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [count, setCount] = React.useState(0);
  const [cycle, setCycle] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const PHASES: { key: Phase; max: number; label: string; color: string; ring: string }[] = [
    { key: "inspire", max: 4, label: "Inspire...", color: "text-blue-600", ring: "ring-blue-400" },
    { key: "segure",  max: 7, label: "Segure...",  color: "text-amber-600", ring: "ring-amber-400" },
    { key: "solte",   max: 8, label: "Solte...",   color: "text-emerald-600", ring: "ring-emerald-400" },
  ];

  const stop = React.useCallback(() => {
    setPhase("idle"); setCount(0); setCycle(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  React.useEffect(() => {
    if (phase === "idle") return;
    const phaseIdx = PHASES.findIndex(p => p.key === phase);
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          const next = (phaseIdx + 1) % PHASES.length;
          if (next === 0) {
            const nextCycle = cycle + 1;
            if (nextCycle > 4) { stop(); return 0; }
            setCycle(nextCycle);
          }
          setPhase(PHASES[next].key);
          return PHASES[next].max;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const current = PHASES.find(p => p.key === phase);
  const pct = current ? ((current.max - count) / current.max) * 100 : 0;

  return (
    <div className="mt-4" onClick={e => e.stopPropagation()}>
      <AnimatePresence mode="wait">
        {phase === "idle" ? (
          <motion.button
            key="start"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            onClick={() => { setPhase("inspire"); setCount(4); setCycle(1); }}
            className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-lg shadow-amber-500/30"
          >
            Iniciar exercício guiado
          </motion.button>
        ) : (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-3 py-2"
          >
            <div className={cn("relative w-20 h-20 rounded-full ring-4 flex flex-col items-center justify-center bg-white shadow-sm", current?.ring)}>
              <motion.div
                className="absolute inset-0 rounded-full opacity-20"
                style={{ background: "currentColor" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className={cn("text-2xl font-black", current?.color)}>{count}</span>
            </div>
            <p className={cn("text-sm font-black", current?.color)}>{current?.label}</p>
            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-current opacity-50"
                style={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold">Ciclo {cycle} de 4</p>
            <button onClick={stop} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">Parar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Expandable Card ────────────────────────────────────────────────────────── */
interface ExpandableCardProps {
  id: string;
  emoji: string;
  titulo: string;
  descricao: string;
  passos: string[];
  gradient: string;
  lightBg: string;
  border: string;
  accent: string;
  stepColor: string;
  video: string | null;
  icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  onVideo?: (id: string) => void;
  showTimer?: boolean;
}

function ExpandableCard({
  emoji, titulo, descricao, passos, gradient, lightBg, border,
  accent, video, icon: Icon, isExpanded, onToggle, onVideo, showTimer,
}: Omit<ExpandableCardProps, "id" | "stepColor">) {
  return (
    <div
      className={cn(
        "rounded-3xl border overflow-hidden cursor-pointer transition-shadow",
        lightBg, border,
        isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md",
      )}
      onClick={onToggle}
    >
      {/* Colored top bar */}
      <div className={cn("h-1 w-full bg-linear-to-r", gradient)} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-11 h-11 rounded-2xl bg-linear-to-br flex items-center justify-center shrink-0 shadow-sm", gradient)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">{titulo}</p>
              <p className={cn("text-xs font-semibold mt-0.5", accent)}>{emoji} {descricao.split(".")[0]}</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn("shrink-0 mt-1 w-7 h-7 rounded-full flex items-center justify-center", isExpanded ? "bg-white/60" : "bg-white/40")}
          >
            <ChevronDown className={cn("w-4 h-4", accent)} />
          </motion.div>
        </div>

        {/* Description always visible */}
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{descricao}</p>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pt-4 border-t border-black/6 dark:border-white/8 mt-3 space-y-3">
                {passos.length > 0 && (
                  <ol className="space-y-2">
                    {passos.map((p, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                        className="flex gap-2.5 text-sm text-foreground"
                      >
                        <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-linear-to-br shrink-0 mt-0.5", gradient)}>
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{p}</span>
                      </motion.li>
                    ))}
                  </ol>
                )}

                {showTimer && <BreathingTimer />}

                {video && (
                  <button
                    onClick={() => onVideo?.(video)}
                    className={cn(
                      "w-full h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white bg-linear-to-r shadow-lg transition-opacity hover:opacity-90",
                      gradient,
                    )}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Assistir vídeo
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────────── */
function SectionHeader({ title, gradient, icon: Icon }: { title: string; gradient: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center shadow-sm", gradient)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-xl font-black tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────────────────────────────── */
export default function InsightsPage() {
  const { records, loading } = useMoodRecords();
  const [fraseIdx, setFraseIdx] = React.useState(() => {
    const d = new Date();
    return (d.getFullYear() * 365 + d.getMonth() * 31 + d.getDate()) % FRASES.length;
  });
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null);
  const [expandedTecnica, setExpandedTecnica] = React.useState<string | null>(null);
  const [expandedMeditacao, setExpandedMeditacao] = React.useState<string | null>(null);

  const [apiResources, setApiResources] = React.useState<{ name: string; description: string; phone?: string | null; url?: string | null; type: string }[]>([]);
  React.useEffect(() => {
    apiFetch<{ name: string; description: string; phone?: string | null; url?: string | null; type: string }[]>("/resources")
      .then(setApiResources).catch(() => {});
  }, []);

  const predictive = React.useMemo(() => computePredictiveInsight(records), [records]);

  const lastMood = records.length > 0
    ? [...records].sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0].mood
    : null;
  const dicas = lastMood ? (DICAS_POR_MOOD[lastMood] ?? DICAS_POR_MOOD.neutral) : DICAS_POR_MOOD.neutral;
  const moodMeta = lastMood ? MOOD_LABELS[lastMood] : null;

  const consecutiveLow = React.useMemo(() => {
    const sorted = [...records].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    let c = 0;
    for (const r of sorted) { if (r.mood === "sad" || r.mood === "anxious") c++; else break; }
    return c;
  }, [records]);

  const RECURSOS_FALLBACK = [
    { key: "cvv",   emoji: "💙", label: "CVV — Centro de Valorização da Vida", desc: "Apoio emocional gratuito 24h · 188", href: "https://www.cvv.org.br" },
    { key: "gov",   emoji: "📖", label: "Guia de Saúde Mental Gov.br",          desc: "Orientações oficiais do Ministério da Saúde", href: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-mental" },
    { key: "caps",  emoji: "🏥", label: "CAPS — Atenção Psicossocial",          desc: "Encontre o CAPS mais próximo de você", href: "https://localizasus.saude.gov.br/" },
  ];

  const recursos = apiResources.length > 0
    ? apiResources.map(r => ({
        key: r.name,
        emoji: r.type === "crise" ? "🆘" : r.type === "apoio" ? "💙" : "📖",
        label: r.name,
        desc: r.description + (r.phone ? ` · ${r.phone}` : ""),
        href: r.url ?? (r.phone ? `tel:${r.phone}` : "#"),
      }))
    : RECURSOS_FALLBACK;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-10 pb-14">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Insights & Apoio</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Conteúdo personalizado para fortalecer sua saúde mental.
          </p>
        </motion.div>

        {/* ── Banner preditivo ────────────────────────────────────── */}
        {!loading && records.length >= 3 && (
          <motion.div variants={fadeUp}>
            <PredictiveInsightBanner insight={predictive} />
          </motion.div>
        )}

        {/* ── Alerta de emergência ────────────────────────────────── */}
        {consecutiveLow >= 3 && (
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/30 p-6 shadow-lg">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-rose-500/10 blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
                  <ShieldAlert className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="text-lg font-black text-rose-900 dark:text-rose-100">Estamos aqui para você. 💛</h2>
                  <p className="text-sm text-rose-700/80 dark:text-rose-300/80 leading-relaxed max-w-md">
                    Os últimos dias parecem ter sido difíceis. Você não precisa carregar tudo sozinho.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a href="tel:188" className="px-5 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center transition-colors shadow-md shadow-rose-500/30">
                      Ligar CVV (188)
                    </a>
                    <a href="https://www.cvv.org.br/chat/" target="_blank" rel="noopener noreferrer" className="px-5 h-9 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center transition-colors">
                      Chat CVV
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Frase do dia ────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 to-violet-600 p-6 shadow-xl shadow-indigo-500/20">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 bg-white/10 px-3 py-1 rounded-full">
                  Frase do dia · {FRASES[fraseIdx].tema}
                </span>
                <button
                  onClick={() => setFraseIdx(i => (i + 1) % FRASES.length)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-indigo-200"
                  title="Próxima frase"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[22px] font-bold text-white leading-snug italic">
                "{FRASES[fraseIdx].texto}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Dicas personalizadas ─────────────────────────────────── */}
        {lastMood && moodMeta && (
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className={cn("w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center text-base shadow-sm", moodMeta.gradient)}>
                {moodMeta.emoji}
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Para você agora
                <span className="ml-2 text-sm font-semibold text-muted-foreground">({moodMeta.label})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {dicas.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{d.icon}</span>
                    <p className="text-sm font-black text-foreground">{d.titulo}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.dica}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Técnicas de mindfulness ──────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-4">
          <SectionHeader title="Técnicas de Mindfulness" gradient="from-amber-500 to-orange-500" icon={Wind} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {TECNICAS.map(t => (
              <ExpandableCard
                key={t.id}
                {...t}
                isExpanded={expandedTecnica === t.id}
                onToggle={() => setExpandedTecnica(expandedTecnica === t.id ? null : t.id)}
                onVideo={setActiveVideo}
                showTimer={t.id === "respiracao478"}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Meditações guiadas ───────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-4">
          <SectionHeader title="Meditações Guiadas" gradient="from-violet-500 to-indigo-500" icon={Moon} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {MEDITACOES.map(m => (
              <ExpandableCard
                key={m.id}
                {...m}
                isExpanded={expandedMeditacao === m.id}
                onToggle={() => setExpandedMeditacao(expandedMeditacao === m.id ? null : m.id)}
                onVideo={setActiveVideo}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Recursos de apoio ────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-4">
          <SectionHeader title="Recursos de Apoio" gradient="from-rose-500 to-pink-500" icon={Heart} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recursos.map((r, i) => (
              <motion.a
                key={r.key}
                href={r.href}
                target={r.href.startsWith("tel:") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="group rounded-2xl bg-card border border-border/50 p-5 shadow-sm hover:shadow-md hover:border-border transition-all space-y-2 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{r.emoji}</span>
                  {r.href.startsWith("tel:")
                    ? <Phone className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-emerald-500 transition-colors" />
                    : <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  }
                </div>
                <p className="text-sm font-black text-foreground group-hover:text-indigo-600 transition-colors leading-snug">{r.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                {r.href.startsWith("tel:") && (
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Toque para ligar</p>
                )}
              </motion.a>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* ── Modal de vídeo ──���──────����──────��───���─────���───────��───── */}
      {activeVideo && (
        <Dialog open onOpenChange={() => setActiveVideo(null)}>
          <DialogContent showCloseButton={false} className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#0F172A]">
              <span className="text-sm font-bold text-white">Vídeo educativo</span>
              <button onClick={() => setActiveVideo(null)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
                title="Vídeo"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}