"use client";

import * as React from "react";
import { getStoredTokens } from "@/lib/api/client";
import { useUser } from "@/lib/context/UserContext";

const PROFILE_KEY = "diario_perfil_v1";

export interface Profile {
  nome: string;
  turma: string;
  escola: string;
  avatarUrl?: string | null;
}

const DEFAULT: Profile = {
  nome: "Estudante",
  turma: "",
  escola: "",
  avatarUrl: null,
};

function loadLocalProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
    return saved ? { ...DEFAULT, ...saved } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function useProfile() {
  const { user } = useUser();
  const [local, setLocal] = React.useState<Profile>(DEFAULT);

  React.useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setLocal(loadLocalProfile());
    } else {
      const saved = loadLocalProfile();
      setLocal({ ...DEFAULT, ...saved });
    }
  }, []);

  return {
    ...local,
    nome: user.name || local.nome || DEFAULT.nome,
    avatarUrl: user.avatarUrl ?? local.avatarUrl,
  };
}
