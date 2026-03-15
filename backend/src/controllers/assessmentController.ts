import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { AssessmentType, RiskLevel, Prisma } from "@prisma/client";
import { createNotification } from "../services/NotificationService";
import { NotificationType } from "@prisma/client";
import { pageMetadata } from "../utils/formatters";

// ─── Score → RiskLevel calculators ───────────────────────────────────────────

function phq9Risk(score: number): RiskLevel {
  if (score <= 4)  return RiskLevel.NONE;
  if (score <= 9)  return RiskLevel.LOW;
  if (score <= 14) return RiskLevel.MEDIUM;
  return RiskLevel.HIGH;
}

function gad7Risk(score: number): RiskLevel {
  if (score <= 4)  return RiskLevel.NONE;
  if (score <= 9)  return RiskLevel.LOW;
  if (score <= 14) return RiskLevel.MEDIUM;
  return RiskLevel.HIGH;
}

function auditRisk(score: number): RiskLevel {
  if (score <= 7)  return RiskLevel.NONE;
  if (score <= 15) return RiskLevel.LOW;
  if (score <= 19) return RiskLevel.MEDIUM;
  return RiskLevel.HIGH;
}

function calcRiskLevel(type: AssessmentType, score: number): RiskLevel {
  switch (type) {
    case AssessmentType.PHQ9:  return phq9Risk(score);
    case AssessmentType.GAD7:  return gad7Risk(score);
    case AssessmentType.AUDIT: return auditRisk(score);
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const QUESTION_COUNT: Record<AssessmentType, number> = {
  PHQ9:  9,
  GAD7:  7,
  AUDIT: 10,
};

const MAX_SCORE_PER_Q: Record<AssessmentType, number> = {
  PHQ9:  3,
  GAD7:  3,
  AUDIT: 4,
};

function validateResponses(
  type: AssessmentType,
  responses: Record<string, number>,
): { valid: boolean; score: number; error?: string } {
  const count = QUESTION_COUNT[type];
  const maxQ = MAX_SCORE_PER_Q[type];

  let score = 0;
  for (let i = 1; i <= count; i++) {
    const val = responses[`q${i}`];
    if (val === undefined || val === null) {
      return { valid: false, score: 0, error: `Resposta ausente para a questão q${i}` };
    }
    if (typeof val !== "number" || val < 0 || val > maxQ) {
      return {
        valid: false,
        score: 0,
        error: `A resposta para q${i} deve ser um número entre 0 e ${maxQ}`,
      };
    }
    score += val;
  }

  return { valid: true, score };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function submitAssessment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { type, responses } = req.body;

    if (!Object.values(AssessmentType).includes(type)) {
      return next(new AppError(400, `Tipo de avaliação inválido. Use: ${Object.values(AssessmentType).join(", ")}`));
    }

    if (!responses || typeof responses !== "object") {
      return next(new AppError(400, "O campo 'responses' deve ser um objeto (ex.: { q1: 2, q2: 0, ... })"));
    }

    const { valid, score, error } = validateResponses(type as AssessmentType, responses);
    if (!valid) return next(new AppError(422, error!));

    const riskLevel = calcRiskLevel(type as AssessmentType, score);

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        type,
        score,
        responses: responses as Prisma.InputJsonValue,
        riskLevel,
      },
    });

    // Notify user about high/medium risk results
    if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.MEDIUM) {
      const label = type === "PHQ9" ? "depressão" : type === "GAD7" ? "ansiedade" : "uso de álcool";
      const tip =
        riskLevel === RiskLevel.HIGH
          ? "Seu resultado indica que pode ser importante conversar com um profissional de saúde mental. O CVV (188) também está disponível 24h."
          : "Seu resultado sugere atenção. Considere conversar com alguém de confiança ou um profissional.";

      await createNotification(
        userId,
        NotificationType.RISK_ALERT,
        `Resultado do questionário de ${label}`,
        tip,
        { assessmentType: type, score, riskLevel },
      );
    }

    res.status(201).json({
      ...assessment,
      interpretation: getInterpretation(type as AssessmentType, score),
    });
  } catch (err) {
    next(err);
  }
}

export async function listAssessments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.assessment.count({ where }),
    ]);

    res.json({ assessments, meta: pageMetadata(total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
}

export async function getLatest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { type } = req.params;

    if (!Object.values(AssessmentType).includes(type as AssessmentType)) {
      return next(new AppError(400, "Tipo de avaliação inválido"));
    }

    const assessment = await prisma.assessment.findFirst({
      where: { userId, type: type as AssessmentType },
      orderBy: { createdAt: "desc" },
    });

    if (!assessment) return next(new AppError(404, "Nenhuma avaliação encontrada para este tipo"));

    res.json({
      ...assessment,
      interpretation: getInterpretation(type as AssessmentType, assessment.score),
    });
  } catch (err) {
    next(err);
  }
}

// ─── Interpretation helper ────────────────────────────────────────────────────

function getInterpretation(type: AssessmentType, score: number): string {
  if (type === AssessmentType.PHQ9) {
    if (score <= 4)  return "Mínimo ou nenhum sintoma depressivo.";
    if (score <= 9)  return "Sintomas leves de depressão. Monitore como você está se sentindo.";
    if (score <= 14) return "Sintomas moderados. Considere conversar com um profissional.";
    if (score <= 19) return "Sintomas moderadamente graves. Recomenda-se suporte profissional.";
    return "Sintomas graves. É importante buscar ajuda profissional urgentemente.";
  }

  if (type === AssessmentType.GAD7) {
    if (score <= 4)  return "Ansiedade mínima.";
    if (score <= 9)  return "Ansiedade leve. Técnicas de respiração e mindfulness podem ajudar.";
    if (score <= 14) return "Ansiedade moderada. Considere apoio profissional.";
    return "Ansiedade grave. Recomenda-se avaliação com profissional de saúde mental.";
  }

  // AUDIT
  if (score <= 7)  return "Consumo de baixo risco.";
  if (score <= 15) return "Consumo com risco crescente. Atenção aos hábitos.";
  if (score <= 19) return "Consumo de risco elevado. Considere conversar com um profissional.";
  return "Possível dependência. Busque avaliação profissional.";
}
