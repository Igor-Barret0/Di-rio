"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getStoredTokens } from "@/lib/api/client";

/**
 * Redireciona para /login se não houver tokens armazenados.
 * Use dentro de qualquer componente que exige autenticação.
 */
export function useRequireAuth() {
  const router = useRouter();

  React.useEffect(() => {
    if (!getStoredTokens()) {
      router.replace("/login");
    }
  }, [router]);
}
