"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const LINKS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/empresas", label: "Empresas" },
  { href: "/parcelamentos", label: "Parcelamentos" },
  { href: "/mensal", label: "Envio mensal" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/importar", label: "Importar" },
  { href: "/admin", label: "Administrador" },
];

export function NavBar({
  userName,
  nomeEscritorio,
  logo,
}: {
  userName: string;
  nomeEscritorio: string;
  logo: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-6 w-auto" />
            )}
            {nomeEscritorio}
          </span>
          <nav className="flex flex-wrap gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
