export interface Challenge {
  id: string;
  slug: string;
  emoji: string;
  title: string;
  description: string;
  totalDays: number;
  xpReward: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "diario_7dias",
    slug: "diario-7-dias",
    emoji: "📓",
    title: "Diário por 7 Dias",
    description: "Registre seu humor todos os dias por uma semana inteira.",
    totalDays: 7,
    xpReward: 200,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200 dark:border-indigo-900/30",
  },
  {
    id: "meditacao_5dias",
    slug: "mindfulness-5-dias",
    emoji: "🧘",
    title: "5 Dias de Mindfulness",
    description: "Pratique uma técnica de mindfulness por 5 dias seguidos.",
    totalDays: 5,
    xpReward: 150,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-900/30",
  },
  {
    id: "positivo_3dias",
    slug: "tres-dias-positivos",
    emoji: "☀️",
    title: "3 Dias Positivos",
    description: "Registre humor feliz ou neutro por 3 dias consecutivos.",
    totalDays: 3,
    xpReward: 100,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/30",
  },
  {
    id: "nota_5dias",
    slug: "escritor-5-dias",
    emoji: "✍️",
    title: "Escritor de 5 Dias",
    description: "Adicione uma nota escrita ao seu registro por 5 dias.",
    totalDays: 5,
    xpReward: 150,
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    borderColor: "border-rose-200 dark:border-rose-900/30",
  },
];
