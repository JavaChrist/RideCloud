/**
 * RideCloud — Design System Page
 *
 * 📌 Placement suggéré dans ton projet Next.js :
 *    app/design-system/page.tsx
 *    (ou app/(internal)/design-system/page.tsx si tu veux l'isoler du marketing)
 *
 * 🌐 Visible ensuite à : http://localhost:3000/design-system
 *
 * ✅ Self-contained : aucune dépendance hors Tailwind + lucide-react (déjà installé).
 * ✅ Server component : aucun "use client" requis.
 * ✅ Couleurs RideCloud officielles (alignées Product Sheet + charte).
 *
 * 💡 Les composants Button / Card / Badge / Input ci-dessous sont locaux
 *    à cette page (uniquement pour la démo). Quand tu seras prêt à les
 *    réutiliser dans l'app, déplace-les dans /components/ui/* .
 */

import {
  Bell,
  Car,
  CheckCircle2,
  FileText,
  Gauge,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            RideCloud · Design System
          </h1>
          <span className="font-mono text-xs text-slate-500">v1.0</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 py-16">
        <ColorsSection />
        <TypographySection />
        <SpacingRadiusSection />
        <ButtonsSection />
        <CardsSection />
        <BadgesSection />
        <InputsSection />
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
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
          <p className="mt-2 text-base text-slate-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        className={`${swatch.tailwind} h-20 ${swatch.hex === "#f8fafc" || swatch.hex === "#ffffff" ? "border-b border-slate-200" : ""}`}
      />
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-slate-900">{swatch.name}</p>
        <p className="font-mono text-xs text-slate-500">{swatch.hex}</p>
        <p className="font-mono text-xs text-slate-400">{swatch.tailwind}</p>
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
    className: "text-[13px] font-medium uppercase tracking-wider text-slate-600",
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="mb-6 font-mono text-xs text-slate-500">
          Geist Sans · fallback Inter
        </p>
        <div className="divide-y divide-slate-200">
          {typeScale.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-6 py-4"
            >
              <span className={item.className}>{item.sample}</span>
              <span className="shrink-0 font-mono text-xs text-slate-500">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <SubTitle>Spacing</SubTitle>
          <div className="space-y-3">
            {spacingScale.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="w-12 font-mono text-xs text-slate-500">
                  {s.name}
                </span>
                <div
                  className="h-2 rounded-full bg-blue-700"
                  style={{ width: `${s.value * 4}px` }}
                />
                <span className="font-mono text-xs text-slate-500">
                  {s.value}px
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <SubTitle>Radius</SubTitle>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {radiusScale.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="h-16 w-16 bg-blue-700"
                  style={{ borderRadius: `${r.value}px` }}
                />
                <span className="font-mono text-xs text-slate-500">
                  {r.name}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
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
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-medium transition-colors duration-200";

  const styles: Record<ButtonVariant, Record<ButtonState, string>> = {
    primary: {
      default: "bg-blue-700 text-white hover:bg-blue-800",
      hover: "bg-blue-800 text-white",
      disabled: "bg-slate-300 text-white cursor-not-allowed",
    },
    secondary: {
      default:
        "bg-white text-blue-700 border border-blue-700 hover:bg-indigo-50",
      hover: "bg-indigo-50 text-blue-700 border border-blue-700",
      disabled:
        "bg-white text-slate-400 border border-slate-200 cursor-not-allowed",
    },
    ghost: {
      default:
        "bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100",
      hover: "bg-slate-100 text-slate-900 border border-slate-200",
      disabled:
        "bg-transparent text-slate-400 border border-slate-200 cursor-not-allowed",
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
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8">
        {variants.map((variant) => (
          <div key={variant}>
            <SubTitle>{variant}</SubTitle>
            <div className="flex flex-wrap items-center gap-4">
              {states.map((state) => (
                <div key={state} className="flex flex-col gap-2">
                  <span className="font-mono text-xs text-slate-500">
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
      className={`flex flex-col gap-3 rounded-2xl bg-white p-6 ${
        featured
          ? "border-2 border-blue-700 shadow-sm"
          : "border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      }`}
    >
      {featured ? (
        <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-blue-700">
          Recommandé
        </span>
      ) : null}
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-indigo-50 text-blue-700">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-[22px] font-medium leading-snug text-slate-900">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-slate-600">{description}</p>
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
        bg: "bg-emerald-50",
        dot: "bg-emerald-500",
        text: "text-emerald-800",
      },
      warning: {
        bg: "bg-amber-50",
        dot: "bg-amber-500",
        text: "text-amber-800",
      },
      danger: {
        bg: "bg-red-50",
        dot: "bg-red-500",
        text: "text-red-800",
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
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
    default: "border border-slate-200",
    focus: "border-2 border-blue-700 ring-4 ring-blue-700/10",
    error: "border border-red-500",
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium uppercase tracking-wider text-slate-600">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        readOnly={state !== "default"}
        className={`h-11 rounded-2xl bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none ${ring[state]}`}
      />
      {state === "error" && error ? (
        <p className="text-xs text-red-700">{error}</p>
      ) : null}
    </div>
  );
}

function InputsSection() {
  return (
    <Section title="Inputs">
      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 md:grid-cols-3">
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
