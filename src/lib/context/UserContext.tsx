"use client";

import * as React from "react";
import { apiFetch, getStoredTokens } from "@/lib/api/client";

export interface UserInfo {
  name: string;
  avatarUrl?: string | null;
  email?: string | null;
}

interface UserContextValue {
  user: UserInfo;
  setUser: (updater: UserInfo | ((prev: UserInfo) => UserInfo)) => void;
}

const DEFAULT_USER: UserInfo = { name: "Estudante", avatarUrl: null };

const UserContext = React.createContext<UserContextValue>({
  user: DEFAULT_USER,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<UserInfo>(DEFAULT_USER);

  React.useEffect(() => {
    if (!getStoredTokens()) return;
    apiFetch<UserInfo>("/auth/me")
      .then((u) => setUserState({ name: u.name ?? "Estudante", avatarUrl: u.avatarUrl, email: u.email }))
      .catch(() => {});
  }, []);

  const setUser = React.useCallback(
    (updater: UserInfo | ((prev: UserInfo) => UserInfo)) => {
      setUserState((prev) => (typeof updater === "function" ? updater(prev) : updater));
    },
    [],
  );

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return React.useContext(UserContext);
}
