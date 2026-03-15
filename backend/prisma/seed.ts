import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Challenges ──────────────────────────────────────────
  const challenges = [
    {
      slug: "diario-7-dias",
      title: "Diário 7 Dias",
      description: "Registre seu humor por 7 dias seguidos",
      emoji: "📓",
      totalDays: 7,
      xpReward: 100,
      category: "habito",
    },
    {
      slug: "mindfulness-5-dias",
      title: "Mindfulness 5 Dias",
      description: "Pratique 5 minutos de respiração consciente por dia",
      emoji: "🧘",
      totalDays: 5,
      xpReward: 75,
      category: "mindfulness",
    },
    {
      slug: "tres-dias-positivos",
      title: "3 Dias Positivos",
      description: "Anote uma coisa boa que aconteceu em 3 dias seguidos",
      emoji: "🌟",
      totalDays: 3,
      xpReward: 50,
      category: "positivo",
    },
    {
      slug: "escritor-5-dias",
      title: "Escritor 5 Dias",
      description: "Escreva pelo menos 3 linhas no diário por 5 dias",
      emoji: "✍️",
      totalDays: 5,
      xpReward: 75,
      category: "criativo",
    },
  ];

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // ── Badges ──────────────────────────────────────────────
  const badges = [
    {
      key: "primeiro_registro",
      name: "Primeiro Passo",
      description: "Fez seu primeiro registro no diário",
      icon: "🌱",
    },
    {
      key: "semana_completa",
      name: "Semana Completa",
      description: "Registrou humor 7 dias seguidos",
      icon: "🔥",
    },
    {
      key: "explorador_emocoes",
      name: "Explorador",
      description: "Usou todos os 4 tipos de humor",
      icon: "🎭",
    },
    {
      key: "constante",
      name: "Constante",
      description: "30 registros no total",
      icon: "💪",
    },
    {
      key: "veterano",
      name: "Veterano",
      description: "14 dias de sequência",
      icon: "🏅",
    },
    {
      key: "guardiao",
      name: "Guardião",
      description: "30 dias de sequência",
      icon: "🛡️",
    },
    {
      key: "lendario",
      name: "Lendário",
      description: "100 registros no total",
      icon: "👑",
    },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { key: b.key },
      update: {},
      create: b,
    });
  }

  // ── Resources ───────────────────────────────────────────
  const resources = [
    {
      name: "CVV — Centro de Valorização da Vida",
      description: "Apoio emocional e prevenção do suicídio 24h",
      phone: "188",
      url: "https://www.cvv.org.br",
      type: "crise",
    },
    {
      name: "CAPS — Centro de Atenção Psicossocial",
      description: "Atendimento gratuito pelo SUS",
      phone: "156",
      url: null,
      type: "apoio",
    },
    {
      name: "SAMU",
      description: "Emergência médica",
      phone: "192",
      url: null,
      type: "crise",
    },
  ];

  for (const r of resources) {
    const existing = await prisma.resource.findFirst({ where: { name: r.name } });
    if (!existing) await prisma.resource.create({ data: r });
  }

  // ── Admin user ───────────────────────────────────────────
  const adminEmail = "admin@diario.app";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador",
        passwordHash: await bcrypt.hash("Admin@1234", 10),
        role: "ADMIN",
        emailVerified: true,
      },
    });
    console.log("👤 Admin criado → admin@diario.app / Admin@1234");
  } else {
    console.log("👤 Admin já existe");
  }

  console.log("✅ Seed concluído");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
