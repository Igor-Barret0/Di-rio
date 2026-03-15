import { Role, Plan, MoodType, RiskLevel, NotificationType, AssessmentType } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type { Role, Plan, MoodType, RiskLevel, NotificationType, AssessmentType };
