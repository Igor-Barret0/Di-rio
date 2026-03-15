"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { saveTokens } from "@/lib/api/client";
import { Logo } from "@/components/shared/Logo";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const accessToken  = searchParams?.get("access_token");
    const refreshToken = searchParams?.get("refresh_token");
    const err          = searchParams?.get("error");

    if (err || !accessToken || !refreshToken) {
      setError("Não foi possível autenticar com o Google. Tente novamente.");
      setTimeout(() => { window.location.href = "/login"; }, 3000);
      return;
    }

    saveTokens({ accessToken, refreshToken });
    window.location.href = "/dashboard";
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <Logo />
      {error ? (
        <p className="text-sm text-rose-600 font-medium">{error}</p>
      ) : (
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Autenticando com Google...
        </div>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
