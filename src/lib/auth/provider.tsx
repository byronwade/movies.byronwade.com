import { useEffect, type ReactNode } from "react";
import { authClient, authEnabled, getBearerToken } from "./client";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!authEnabled) return;
    if (!getBearerToken()) return;
    void authClient.getSession();
  }, []);
  return <>{children}</>;
}
