/**
 * RideCloud — Design System Page (v2.1)
 *
 * 📌 Emplacement : src/app/design-system/page.tsx
 * 🌐 URL : http://localhost:3000/design-system
 *
 * ✅ Server Component pur — aucun "use client".
 * ✅ Aligné sur les tokens Tailwind ride-* (tailwind.config.ts).
 * ✅ Documente les patterns réellement utilisés dans l'app authentifiée
 *    (KPI tiles, status items, page headers, empty states).
 *
 * 💡 Les composants Button / Card / Badge / Input ci-dessous sont locaux
 *    à cette page. La réutilisation dans l'app passe par shadcn/ui
 *    (src/components/ui/*) auquel on applique les classes ride-*.
 */

import {
  Bell,
  Car,
  CheckCircle2,
  FileText,
  Gauge,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-ride-mesh opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-ride-grid dark:bg-ride-grid-light bg-ride-grid-sm [mask-image:radial-gradient(ellipse_50%_40%_at_50%_0%,black,transparent)]"
      />

      <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            RideCloud · Design System
          </h1>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">v2.1 · patterns</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 py-16">
        <ColorsSection />
        <TypographySection />
        <SpacingRadiusSection />
        <ShadowsSection />
        <GradientsSection />
        <AnimationsSection />
        <ButtonsSection />
        <CardsSection />
        <KpiTilesSection />
        <StatusItemsSection />
        <PageHeadersSection />
        <EmptyStatesSection />
        <BadgesSection />
        <InputsSection />
      </main>

      <footer className="relative border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"
        />
        RideCloud · Charte officielle · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Section wrappers
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </h3>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Colors
// ─────────────────────────────────────────────────────────────────────────────

type Swatch = { name: string; hex: string; tailwind: string };

const brandSwatches: Swatch[] = [
  { name: "Brand", hex: "#1d4ed8", tailwind: "bg-blue-700" },
  { name: "Brand hover", hex: "#1e40af", tailwind: "bg-blue-800" },
  { name: "Indigo deep", hex: "#1e1b4b", tailwind: "bg-indigo-950" },
];

const neutralSwatches: Swatch[] = [
  { name: "Background", hex: "#f8fafc", tailwind: "bg-slate-50" },
  { name: "Surface", hex: "#ffffff", tailwind: "bg-white" },
  { name: "Text primary", hex: "#0f172a", tailwind: "bg-slate-900" },
  { name: "Text secondary", hex: "#475569", tailwind: "bg-slate-600" },
  { name: "Text disabled", hex: "#94a3b8", tailwind: "bg-slate-400" },
  { name: "Border", hex: "#e2e8f0", tailwind: "bg-slate-200" },
];

const statusSwatches: Swatch[] = [
  { name: "Success", hex: "#10b981", tailwind: "bg-emerald-500" },
  { name: "Warning", hex: "#f59e0b", tailwind: "bg-amber-500" },
  { name: "Danger", hex: "#ef4444", tailwind: "bg-red-500" },
];

const pastelSwatches: Swatch[] = [
  { name: "Sky", hex: "#e0f2fe", tailwind: "bg-sky-100" },
  { name: "Indigo", hex: "#eef2ff", tailwind: "bg-indigo-50" },
  { name: "Slate", hex: "#f1f5f9", tailwind: "bg-slate-100" },
  { name: "Mint", hex: "#ecfdf5", tailwind: "bg-emerald-50" },
];

function SwatchCard({ swatch }: { swatch: Swatch }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div
        className={`${swatch.tailwind} h-20 ${swatch.hex === "#f8fafc" || swatch.hex === "#ffffff" ? "border-b border-slate-200 dark:border-slate-800" : ""}`}
      />
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{swatch.name}</p>
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{swatch.hex}</p>
        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{swatch.tailwind}</p>
      </div>
    </div>
  );
}

function ColorsSection() {
  return (
    <Section
      title="Couleurs"
      description="Palette RideCloud. Tailwind par défaut, aucun config personnalisé requis."
    >
      <div className="space-y-8">
        <div>
          <SubTitle>Brand</SubTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brandSwatches.map((s) => (
              <SwatchCard key={s.name} swatch={s} />
            ))}
          </div>
        </div>

        <div>
          <SubTitle>Neutres</SubTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {neutralSwatches.map((s) => (
              <SwatchCard key={s.name} swatch={s} />
            ))}
          </div>
        </div>

        <div>
          <SubTitle>Statuts</SubTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {statusSwatches.map((s) => (
              <SwatchCard key={s.name} swatch={s} />
            ))}
          </div>
        </div>

        <div>
          <SubTitle>Pastels</SubTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {pastelSwatches.map((s) => (
              <SwatchCard key={s.name} swatch={s} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Typography
// ─────────────────────────────────────────────────────────────────────────────

const typeScale = [
  {
    label: "Hero",
    sample: "Hero title",
    specs: "56 / 600 / -2%",
    className: "text-[56px] font-semibold leading-[1.1] tracking-tight",
  },
  {
    label: "H1",
    sample: "Section title",
    specs: "36 / 600 / -1.5%",
    className: "text-4xl font-semibold leading-tight tracking-tight",
  },
  {
    label: "H2",
    sample: "Sous-titre · accroche",
    specs: "22 / 500 / -1%",
    className: "text-[22px] font-medium leading-snug",
  },
  {
    label: "Body",
    sample: "Corps de texte courant pour les paragraphes.",
    specs: "16 / 400 / 0%",
    className: "text-base leading-relaxed",
  },
  {
    label: "Caption",
    sample: "CAPTION · LABEL",
    specs: "13 / 500 / +2%",
    className: "text-[13px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300",
  },
  {
    label: "KPI",
    sample: "€1 247,80",
    specs: "48 / 600 / mono",
    className: "font-mono text-5xl font-semibold tracking-tight tabular-nums",
  },
];

function TypographySection() {
  return (
    <Section
      title="Typographie"
      description="Geist Sans en principal, Geist Mono pour les valeurs chiffrées (KPI)."
    >
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <p className="mb-6 font-mono text-xs text-slate-500 dark:text-slate-400">
          Geist Sans · fallback Inter
        </p>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {typeScale.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-6 py-4"
            >
              <span className={item.className}>{item.sample}</span>
              <span className="shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
                {item.specs}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Spacing & Radius
// ─────────────────────────────────────────────────────────────────────────────

const spacingScale = [
  { name: "xs", value: 4 },
  { name: "sm", value: 8 },
  { name: "md", value: 12 },
  { name: "lg", value: 16 },
  { name: "xl", value: 24 },
  { name: "2xl", value: 32 },
  { name: "3xl", value: 48 },
];

const radiusScale = [
  { name: "sm", value: 6 },
  { name: "md", value: 10 },
  { name: "lg", value: 16 },
  { name: "xl", value: 20 },
  { name: "full", value: 9999 },
];

function SpacingRadiusSection() {
  return (
    <Section title="Spacing & Radius">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <SubTitle>Spacing</SubTitle>
          <div className="space-y-3">
            {spacingScale.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="w-12 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {s.name}
                </span>
                <div
                  className="h-2 rounded-full bg-blue-700"
                  style={{ width: `${s.value * 4}px` }}
                />
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {s.value}px
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <SubTitle>Radius</SubTitle>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {radiusScale.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-16 w-16 bg-blue-700"
                  style={{ borderRadius: `${r.value}px` }}
                />
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {r.name}
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {r.value === 9999 ? "full" : `${r.value}px`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shadows
// ─────────────────────────────────────────────────────────────────────────────

const shadowScale: { name: string; className: string; usage: string }[] = [
  { name: "xs", className: "shadow-ride-xs", usage: "Cards plates, KPI tiles" },
  { name: "sm", className: "shadow-ride-sm", usage: "Inputs, controls" },
  { name: "md", className: "shadow-ride-md", usage: "Cards interactives au hover" },
  { name: "lg", className: "shadow-ride-lg", usage: "Cards features hover" },
  { name: "xl", className: "shadow-ride-xl", usage: "Hero mockup, modals" },
  { name: "float", className: "shadow-ride-float", usage: "Cartes flottantes premium" },
  { name: "glow-sm", className: "shadow-ride-glow-sm", usage: "CTA secondaire" },
  { name: "glow", className: "shadow-ride-glow", usage: "CTA primaire actif" },
];

function ShadowsSection() {
  return (
    <Section
      title="Profondeur · Ombres"
      description="Échelle d'ombres pensée pour empiler les surfaces sans bruit visuel. Les glows utilisent le bleu signature (#1d4ed8)."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shadowScale.map((s) => (
          <div
            key={s.name}
            className={`flex h-32 flex-col justify-end rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${s.className}`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{s.name}</p>
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{s.className}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.usage}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Gradients & Effects
// ─────────────────────────────────────────────────────────────────────────────

const gradientTokens = [
  { name: "primary", className: "bg-ride-gradient-primary", note: "CTA principal" },
  { name: "primary-hover", className: "bg-ride-gradient-primary-hover", note: "CTA primary hover" },
  { name: "dark", className: "bg-ride-gradient-dark", note: "Sections immersives, beta CTA" },
  { name: "surface", className: "bg-ride-gradient-surface", note: "Fonds de sections" },
  { name: "card", className: "bg-ride-gradient-card", note: "Cartes premium subtiles" },
  { name: "mesh", className: "bg-ride-mesh", note: "Ambient background" },
  { name: "grid", className: "bg-ride-grid bg-ride-grid-sm", note: "Overlay structure" },
  { name: "dots", className: "bg-ride-dots bg-ride-dots", note: "Overlay décoratif" },
];

function GradientsSection() {
  return (
    <Section
      title="Gradients & Effets"
      description="Gradients signés RideCloud + utilitaires d'overlay (grid, dots) pour structurer les fonds sans bruit."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gradientTokens.map((g) => (
          <div
            key={g.name}
            className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className={`h-24 ${g.className}`} />
            <div className="px-3 py-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{g.name}</p>
              <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{g.className}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{g.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <SubTitle>Texte gradient signature</SubTitle>
        <p className="bg-ride-gradient-text bg-clip-text text-4xl font-semibold tracking-tight text-transparent [background-size:200%_auto] animate-shimmer">
          de tous vos véhicules.
        </p>
        <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
          bg-ride-gradient-text · bg-clip-text · animate-shimmer
        </p>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Animations
// ─────────────────────────────────────────────────────────────────────────────

const animationTokens = [
  {
    name: "fade-in-up",
    className: "animate-fade-in-up",
    note: "Apparition de section / élément",
  },
  {
    name: "fade-in",
    className: "animate-fade-in",
    note: "Apparition simple (FAQ, contenu)",
  },
  {
    name: "float",
    className: "animate-float",
    note: "Cartes flottantes (notification, KPI)",
  },
  {
    name: "float-slow",
    className: "animate-float-slow",
    note: "Floating éléments hero",
  },
  {
    name: "glow-pulse",
    className: "animate-glow-pulse",
    note: "Halo ambient (beta CTA)",
  },
  {
    name: "shimmer",
    className: "animate-shimmer",
    note: "Texte gradient en mouvement",
  },
  {
    name: "pulse-dot",
    className: "animate-pulse-dot",
    note: "Dot status badge",
  },
];

function AnimationsSection() {
  return (
    <Section
      title="Animations & Transitions"
      description="Toutes les animations sont en CSS pur, respectent prefers-reduced-motion, et utilisent la courbe ride-spring pour les transitions interactives."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {animationTokens.map((a) => (
          <div
            key={a.name}
            className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className="flex h-24 items-center justify-center bg-slate-50/60 dark:bg-slate-950/60">
              {a.name === "shimmer" ? (
                <span className="bg-ride-gradient-text bg-clip-text text-lg font-semibold text-transparent [background-size:200%_auto] animate-shimmer">
                  RideCloud
                </span>
              ) : a.name === "pulse-dot" ? (
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-blue-500" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600" />
                </span>
              ) : (
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-ride-gradient-primary text-white shadow-ride-glow-sm ${a.className}`}
                >
                  <Car className="h-4 w-4" strokeWidth={2.25} />
                </div>
              )}
            </div>
            <div className="px-3 py-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{a.name}</p>
              <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{a.className}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.note}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Button component (démo)
// ─────────────────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonState = "default" | "hover" | "disabled";

function Button({
  variant = "primary",
  state = "default",
  children,
}: {
  variant?: ButtonVariant;
  state?: ButtonState;
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-medium transition-all duration-300 ease-ride-spring";

  const styles: Record<ButtonVariant, Record<ButtonState, string>> = {
    primary: {
      default:
        "bg-ride-gradient-primary text-white shadow-ride-glow-sm hover:shadow-ride-glow hover:brightness-110",
      hover: "bg-ride-gradient-primary-hover text-white shadow-ride-glow",
      disabled:
        "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none",
    },
    secondary: {
      default:
        "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-ride-xs hover:border-blue-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:shadow-ride-glow-sm",
      hover: "bg-indigo-50 dark:bg-indigo-950/40 text-blue-700 dark:text-blue-300 border border-blue-700 shadow-ride-glow-sm",
      disabled:
        "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-not-allowed",
    },
    ghost: {
      default:
        "bg-transparent text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:shadow-ride-sm",
      hover: "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 shadow-ride-sm",
      disabled:
        "bg-transparent text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-not-allowed",
    },
  };

  return (
    <button
      type="button"
      disabled={state === "disabled"}
      className={`${base} ${styles[variant][state]}`}
    >
      {children}
    </button>
  );
}

function ButtonsSection() {
  const variants: ButtonVariant[] = ["primary", "secondary", "ghost"];
  const states: ButtonState[] = ["default", "hover", "disabled"];

  return (
    <Section
      title="Boutons"
      description="3 variantes × 3 états. Padding 12/20, radius 16px, texte 15/Medium."
    >
      <div className="space-y-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        {variants.map((variant) => (
          <div key={variant}>
            <SubTitle>{variant}</SubTitle>
            <div className="flex flex-wrap items-center gap-4">
              {states.map((state) => (
                <div key={state} className="flex flex-col gap-2">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {state}
                  </span>
                  <Button variant={variant} state={state}>
                    Rejoindre la bêta
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Card component (démo)
// ─────────────────────────────────────────────────────────────────────────────

function Card({
  icon: Icon,
  title,
  description,
  featured = false,
}: {
  icon: typeof Car;
  title: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`group/card relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-ride-gradient-card p-6 transition-all duration-500 ease-ride-spring hover:-translate-y-1 ${
        featured
          ? "border-2 border-blue-700 shadow-ride-glow"
          : "border border-slate-200/80 dark:border-slate-800 shadow-ride-xs hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-ride-lg"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(29,78,216,0.07),transparent_60%)]"
      />
      {featured ? (
        <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-blue-100 dark:ring-blue-900">
          Recommandé
        </span>
      ) : null}
      <div className="relative inline-flex">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-blue-50 dark:to-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-100/80 dark:ring-blue-900 transition-all duration-500 group-hover/card:bg-ride-gradient-primary group-hover/card:text-white group-hover/card:shadow-ride-glow-sm">
          <Icon className="h-5 w-5 transition-transform duration-500 group-hover/card:scale-110" strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="text-[22px] font-medium leading-snug text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function CardsSection() {
  return (
    <Section title="Cards">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          icon={Wrench}
          title="Plan d'entretien intelligent"
          description="Adapté à votre marque et modèle. Échéances calculées automatiquement."
        />
        <Card
          icon={Car}
          title="Multi-véhicules"
          description="Voiture, moto, scooter, utilitaire — tout au même endroit."
          featured
        />
        <Card
          icon={TrendingUp}
          title="Suivi des coûts"
          description="Mois, année, coût total, coût au kilomètre. En temps réel."
        />
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  KPI Tiles — utilisées dans VehicleCostSummary, fiche véhicule, mockup hero
// ─────────────────────────────────────────────────────────────────────────────

type KpiTone = "neutral" | "positive";

const kpiTiles: { label: string; value: string; suffix?: string; tone?: KpiTone }[] = [
  { label: "Ce mois", value: "84,20 €", tone: "positive" },
  { label: "Cette année", value: "1 247 €" },
  { label: "Total cumulé", value: "3 892 €" },
  { label: "Coût / km", value: "0,18 €", suffix: "/ km" },
];

function KpiTile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="group/kpi relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-ride-gradient-card p-4 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-ride-md">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
        {value}
        {suffix ? (
          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">{suffix}</span>
        ) : null}
      </p>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100"
      />
    </div>
  );
}

function KpiTilesSection() {
  return (
    <Section
      title="KPI Tiles"
      description="Tuiles métriques utilisées pour les coûts, kilométrages et indicateurs chiffrés. Toujours en font-mono tabular-nums pour l'alignement vertical des chiffres."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiTiles.map((t) => (
          <KpiTile key={t.label} {...t} />
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        bg-ride-gradient-card · shadow-ride-xs · hover: -translate-y-0.5 · shadow-ride-md ·
        valeurs en font-mono tabular-nums
      </p>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Status Items — utilisés dans VehicleRemindersCard
// ─────────────────────────────────────────────────────────────────────────────

type StatusLevel = "urgent" | "important" | "normal" | "success";

const statusLevelStyles: Record<
  StatusLevel,
  { container: string; indicator: string; badge: string }
> = {
  urgent: {
    container: "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/40 ring-1 ring-red-100 dark:ring-red-900",
    indicator: "bg-red-500",
    badge: "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300",
  },
  important: {
    container: "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/40 ring-1 ring-amber-100 dark:ring-amber-900",
    indicator: "bg-amber-500",
    badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
  },
  normal: {
    container: "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800",
    indicator: "bg-slate-400",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
  },
  success: {
    container: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/40 ring-1 ring-emerald-100 dark:ring-emerald-900",
    indicator: "bg-emerald-500",
    badge: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
  },
};

function StatusItem({
  level,
  title,
  meta,
}: {
  level: StatusLevel;
  title: string;
  meta: string;
}) {
  const s = statusLevelStyles[level];
  return (
    <div
      className={`group/item relative overflow-hidden rounded-2xl border p-4 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ride-md ${s.container}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${s.indicator}`}
      />
      <div className="ml-2">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-900 dark:text-slate-50">{title}</p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.badge}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
            {level}
          </span>
        </div>
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{meta}</p>
      </div>
    </div>
  );
}

function StatusItemsSection() {
  return (
    <Section
      title="Status Items"
      description="Items d'alerte avec barre verticale signature à gauche. Quatre niveaux : urgent / important / normal / success. Utilisés dans les rappels d'entretien, les listes d'échéances, les notifications."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <StatusItem
          level="urgent"
          title="Plaquettes de frein"
          meta="3 200 km dépassés · 12 jours en retard"
        />
        <StatusItem
          level="important"
          title="Vidange moteur"
          meta="dans 820 km · à planifier"
        />
        <StatusItem
          level="normal"
          title="Contrôle technique"
          meta="dans 18 mois · 04/12/2027"
        />
        <StatusItem
          level="success"
          title="Filtre à air"
          meta="effectué le 12/03/2026 · à jour"
        />
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page Headers — bandeau d'introduction de section
// ─────────────────────────────────────────────────────────────────────────────

function PageHeadersSection() {
  return (
    <Section
      title="Page Headers"
      description="Bandeau d'introduction utilisé en haut de chaque page interne. Badge contextuel + titre + texte d'explication + chip de stat optionnelle."
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-ride-gradient-card p-5 shadow-ride-sm md:p-7">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
        />
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-ride-xs backdrop-blur">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          RideCloud · Garage
        </span>
        <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
          Catégories de véhicules
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
          Choisissez une catégorie pour ouvrir votre parc et accéder à
          l&apos;historique complet de chaque véhicule.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 dark:border-blue-900/70 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 shadow-ride-xs backdrop-blur">
          <span className="font-mono tabular-nums">12</span>
          véhicule(s) enregistré(s)
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        bg-ride-gradient-card · shadow-ride-sm · top-line gradient · badge contextuel ·
        chip stats avec font-mono tabular-nums
      </p>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Empty States — état vide premium
// ─────────────────────────────────────────────────────────────────────────────

function EmptyStatesSection() {
  return (
    <Section
      title="Empty States"
      description="État premium pour les listes vides : titre clair, texte secondaire, CTA gradient. Border-dashed pour signaler l'invitation à agir."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Variante 1 : invitation à créer */}
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-10 text-center shadow-ride-xs backdrop-blur-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-blue-50 dark:to-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-100/80 dark:ring-blue-900">
            <PlusCircle className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="text-base font-medium text-slate-900 dark:text-slate-50">
            Aucun véhicule dans cette catégorie.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ajoutez votre premier véhicule pour commencer le suivi.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-ride-gradient-primary px-5 py-2.5 text-[15px] font-medium text-white shadow-ride-glow-sm transition-all duration-300 hover:shadow-ride-glow hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={2.25} />
            Ajouter un véhicule
          </button>
        </div>

        {/* Variante 2 : succès / à jour */}
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/40 p-6 shadow-ride-xs ring-1 ring-emerald-100 dark:ring-emerald-900">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-900">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-medium text-emerald-900 dark:text-emerald-200">
              Aucun rappel actif.
            </p>
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/80">
              Le véhicule est à jour pour le moment.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Badge component (démo)
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "danger";

function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: ReactNode;
}) {
  const styles: Record<BadgeVariant, { bg: string; dot: string; text: string }> =
    {
      success: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        dot: "bg-emerald-500",
        text: "text-emerald-800 dark:text-emerald-300",
      },
      warning: {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        dot: "bg-amber-500",
        text: "text-amber-800 dark:text-amber-300",
      },
      danger: {
        bg: "bg-red-50 dark:bg-red-950/40",
        dot: "bg-red-500",
        text: "text-red-800 dark:text-red-300",
      },
    };

  const s = styles[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {children}
    </span>
  );
}

function BadgesSection() {
  return (
    <Section
      title="Badges de statut"
      description="Statuts entretien : À jour · Bientôt dû · En retard."
    >
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="success">À jour</Badge>
          <Badge variant="warning">Bientôt dû</Badge>
          <Badge variant="danger">En retard</Badge>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Input component (démo)
// ─────────────────────────────────────────────────────────────────────────────

type InputState = "default" | "focus" | "error";

function Input({
  label,
  placeholder,
  state = "default",
  error,
}: {
  label: string;
  placeholder: string;
  state?: InputState;
  error?: string;
}) {
  const ring: Record<InputState, string> = {
    default: "border border-slate-200 dark:border-slate-800",
    focus: "border-2 border-blue-700 ring-4 ring-blue-700/10",
    error: "border border-red-500",
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        readOnly={state !== "default"}
        className={`h-11 rounded-2xl bg-white dark:bg-slate-900 px-3.5 text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none ${ring[state]}`}
      />
      {state === "error" && error ? (
        <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
      ) : null}
    </div>
  );
}

function InputsSection() {
  return (
    <Section title="Inputs">
      <div className="grid gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:grid-cols-3">
        <Input label="Default" placeholder="Marque du véhicule" />
        <Input
          label="Focus"
          placeholder="Marque du véhicule"
          state="focus"
        />
        <Input
          label="Error"
          placeholder="Marque du véhicule"
          state="error"
          error="Ce champ est requis"
        />
      </div>
    </Section>
  );
}
