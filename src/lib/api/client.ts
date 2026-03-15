const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api";

const AUTH_KEY = "diario_auth_v1";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(AUTH_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** Tenta usar o refreshToken para obter novos tokens. Retorna true se conseguiu. */
async function tryRefreshTokens(): Promise<boolean> {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) return false;
    const newTokens: AuthTokens = await res.json();
    saveTokens(newTokens);
    return true;
  } catch {
    return false;
  }
}

function buildHeaders(extra?: HeadersInit): Record<string, string> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extra as Record<string, string>),
  };
  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }
  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: extraHeaders, ...rest } = options;
  const headers = buildHeaders(extraHeaders as HeadersInit);

  let res = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  // Token expirado — tenta refresh e reenvia uma vez
  if (res.status === 401) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      const retryHeaders = buildHeaders(extraHeaders as HeadersInit);
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers: retryHeaders });
    } else {
      clearTokens();
      // Redireciona para login na próxima renderização
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Sessão expirada. Faça login novamente.");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.message ?? body.error ?? `HTTP ${res.status}`
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
