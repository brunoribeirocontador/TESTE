import type { ReactNode } from "react";
import { verifySession } from "@/lib/dal";
import { getConfiguracao } from "@/lib/config";
import { NavBar } from "./nav-bar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [session, config] = await Promise.all([verifySession(), getConfiguracao()]);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar userName={session.name} nomeEscritorio={config.nome} logo={config.logo} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
