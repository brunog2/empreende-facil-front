import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";
import { LANDING_URL } from "@/lib/landing";

const footerLinks = [
  { label: "Guia de uso", to: "/guia" },
  { label: "Política de privacidade", to: "/privacidade" },
  { label: "Termos de uso", to: "/termos" },
  { label: "Planos", to: "/planos" },
];

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <a
            href={LANDING_URL}
            className="inline-flex min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            aria-label="Gestão Pro — voltar para o site"
          >
            <BrandLogo />
          </a>
          <a
            href={LANDING_URL}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </a>
        </div>
      </header>
      <main className="relative flex-1">{children}</main>
      <footer className="bg-ink px-4 pb-8 pt-10 text-slate-300 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo tone="inverse" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Gestão simples para pequenos negócios venderem, organizarem e crescerem com mais clareza.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm" aria-label="Links úteis">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-medium text-slate-300 transition-colors hover:text-primary-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Gestão Pro. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
