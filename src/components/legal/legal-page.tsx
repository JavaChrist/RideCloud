import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LegalPageProps {
  badge: string;
  title: string;
  description?: string;
  lastUpdated: string;
  toc?: { id: string; label: string }[];
  children: ReactNode;
}

export function LegalPage({ badge, title, description, lastUpdated, toc, children }: LegalPageProps) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-ride-gradient-card p-8 shadow-ride-sm md:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/70 to-transparent"
      />

      <header className="mb-8 border-b border-slate-200/70 pb-8">
        <Badge variant="secondary" className="mb-4 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50">
          {badge}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 ride-text-balance md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-base text-slate-600 ride-text-balance md:text-lg">
            {description}
          </p>
        ) : null}
        <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">
          Dernière mise à jour · <span className="font-mono normal-case">{lastUpdated}</span>
        </p>
      </header>

      {toc && toc.length > 0 ? (
        <nav
          aria-label="Sommaire"
          className="mb-10 rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-ride-xs backdrop-blur-sm"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Sommaire</p>
          <ol className="space-y-1.5 text-sm">
            {toc.map((item, idx) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] text-slate-500">
                  {idx + 1}
                </span>
                <a
                  href={`#${item.id}`}
                  className="leading-snug text-slate-600 transition-colors hover:text-blue-700"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="space-y-10 text-[15px] leading-relaxed text-slate-700">
        {children}
      </div>
    </article>
  );
}

interface LegalSectionProps {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function LegalSection({ id, title, children, className }: LegalSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 text-slate-700">{children}</div>
    </section>
  );
}

interface LegalSubsectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSubsection({ title, children }: LegalSubsectionProps) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-base font-semibold text-slate-800">{title}</h3>
      <div className="space-y-2 text-slate-700">{children}</div>
    </div>
  );
}

export function ToFill({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[13px] text-amber-800"
      title="À compléter avant la mise en production"
    >
      [{children}]
    </span>
  );
}

export function LegalCallout({
  variant = "info",
  children
}: {
  variant?: "info" | "warning" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900"
  };
  return (
    <div className={cn("rounded-2xl border p-4 text-sm shadow-ride-xs", styles[variant])}>
      {children}
    </div>
  );
}
