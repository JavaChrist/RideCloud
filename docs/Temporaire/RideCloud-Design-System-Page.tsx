/**
 * RideCloud — Design System Page (v2.1 · standalone export)
 *
 * 📌 Placement suggéré dans ton projet Next.js :
 *    app/design-system/page.tsx
 *    (ou app/(internal)/design-system/page.tsx pour l'isoler du marketing)
 *
 * 🌐 Visible ensuite à : http://localhost:3000/design-system
 *
 * ✅ Self-contained : aucune dépendance hors Tailwind + lucide-react.
 * ✅ Server component : aucun "use client" requis.
 * ✅ Aligné sur la production RideCloud (Mollie 3,99 € / 6,99 €, IA Mistral, modales useConfirm).
 *
 * 💡 Les composants Button / Card / Badge / Input / Dialog ci-dessous sont
 *    locaux à cette page (uniquement pour la démo). Pour les réutiliser,
 *    déplace-les vers /components/ui/* avec shadcn/ui + Radix.
 */

import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Info,
  Sparkles,
  Trash2,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";

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
          <span className="font-mono text-xs text-slate-500">
            v2.1 · production ready
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 py-16">
        <ColorsSection />
        <GradientsSection />
        <ShadowsSection />
        <TypographySection />
        <SpacingRadiusSection />
        <ButtonsSection />
        <CardsSection />
        <BadgesSection />
        <InputsSection />
        <ModalsSection />
        <PricingSection />
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
  { name: "Accent indigo", hex: "#4338ca", tailwind: "bg-indigo-700" },
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
  { name: "Info", hex: "#0ea5e9", tailwind: "bg-sky-500" },
  { name: "AI", hex: "#8b5cf6", tailwind: "bg-violet-500" },
];

const pastelSwatches: Swatch[] = [
  { name: "Sky", hex: "#e0f2fe", tailwind: "bg-sky-100" },
  { name: "Indigo", hex: "#eef2ff", tailwind: "bg-indigo-50" },
  { name: "Slate", hex: "#f1f5f9", tailwind: "bg-slate-100" },
  { name: "Mint", hex: "#ecfdf5", tailwind: "bg-emerald-50" },
  { name: "Violet", hex: "#f5f3ff", tailwind: "bg-violet-50" },
  { name: "Amber", hex: "#fffbeb", tailwind: "bg-amber-50" },
];

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const needsBorder = swatch.hex === "#f8fafc" || swatch.hex === "#ffffff";
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        className={`${swatch.tailwind} h-20 ${needsBorder ? "border-b border-slate-200" : ""}`}
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
      description="Palette RideCloud. Tailwind par défaut, aucune config personnalisée requise."
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
          <SubTitle>Statuts &amp; sémantique</SubTitle>
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
//  Gradients
// ─────────────────────────────────────────────────────────────────────────────

const gradients: { name: string; className: string; stops: string }[] = [
  {
    name: "ride-gradient-primary",
    className: "bg-gradient-to-br from-blue-700 to-indigo-700",
    stops: "#1d4ed8 → #4338ca",
  },
  {
    name: "ride-gradient-dark",
    className: "bg-gradient-to-br from-indigo-950 via-blue-700 to-indigo-700",
    stops: "#1e1b4b → #1d4ed8 → #4338ca",
  },
  {
    name: "ride-gradient-surface",
    className: "bg-gradient-to-b from-white to-slate-50/60",
    stops: "#ffffff → #f8fafc/60",
  },
  {
    name: "ride-gradient-ai",
    className: "bg-gradient-to-br from-violet-500 to-indigo-500",
    stops: "#8b5cf6 → #6366f1",
  },
];

function GradientsSection() {
  return (
    <Section
      title="Gradients de marque"
      description="Utilisés pour les CTA premium, les en-têtes immersifs et les éléments IA."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gradients.map((g) => (
          <div
            key={g.name}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className={`h-24 ${g.className}`} />
            <div className="px-4 py-3">
              <p className="font-mono text-xs text-slate-700">{g.name}</p>
              <p className="font-mono text-[11px] text-slate-500">{g.stops}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex h-24 items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-500 to-blue-700">
          <span className="text-2xl font-semibold tracking-tight text-white">
            RideCloud
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-xs text-slate-700">ride-gradient-text</p>
          <p className="font-mono text-[11px] text-slate-500">
            #1d4ed8 → #6366f1 → #1d4ed8 · appliqué via{" "}
            <code>bg-clip-text text-transparent</code>
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shadows
// ─────────────────────────────────────────────────────────────────────────────

const shadows: { name: string; className: string; description: string }[] = [
  { name: "ride-xs", className: "shadow-sm", description: "Boutons, inputs" },
  {
    name: "ride-md",
    className: "shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)]",
    description: "Cartes au repos",
  },
  {
    name: "ride-lg",
    className:
      "shadow-[0_12px_32px_-8px_rgba(15,23,42,0.12),0_4px_8px_rgba(15,23,42,0.04)]",
    description: "Cartes survolées · modales",
  },
  {
    name: "ride-float",
    className:
      "shadow-[0_32px_80px_-24px_rgba(29,78,216,0.22),0_12px_32px_-16px_rgba(15,23,42,0.12)]",
    description: "Hero, sections marketing",
  },
  {
    name: "ride-glow",
    className:
      "shadow-[0_0_0_1px_rgba(29,78,216,0.10),0_8px_32px_-8px_rgba(29,78,216,0.35)]",
    description: "CTA Premium, plan recommandé",
  },
];

function ShadowsSection() {
  return (
    <Section
      title="Ombres premium"
      description="5 niveaux d'élévation pour traduire la hiérarchie et donner du relief sans bruit visuel."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {shadows.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-3">
              <div
                className={`h-20 w-full rounded-xl bg-white ${s.className}`}
              />
              <div className="text-center">
                <p className="font-mono text-xs text-slate-700">{s.name}</p>
                <p className="text-[11px] text-slate-500">{s.description}</p>
              </div>
            </div>
          ))}
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
  { name: "sm", value: 8 },
  { name: "md", value: 12 },
  { name: "lg", value: 16 },
  { name: "xl", value: 20 },
  { name: "full", value: 9999 },
];

function SpacingRadiusSection() {
  return (
    <Section title="Spacing &amp; Radius">
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

type ButtonVariant = "primary" | "secondary" | "ghost" | "ai";
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
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium transition-colors duration-200";

  const styles: Record<ButtonVariant, Record<ButtonState, string>> = {
    primary: {
      default:
        "bg-gradient-to-br from-blue-700 to-indigo-700 text-white shadow-[0_4px_12px_-2px_rgba(29,78,216,0.30)] hover:from-blue-800 hover:to-indigo-800",
      hover:
        "bg-gradient-to-br from-blue-800 to-indigo-800 text-white shadow-[0_8px_20px_-4px_rgba(29,78,216,0.40)]",
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
    ai: {
      default:
        "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_4px_12px_-2px_rgba(139,92,246,0.35)] hover:from-violet-600 hover:to-indigo-600",
      hover:
        "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_8px_20px_-4px_rgba(139,92,246,0.45)]",
      disabled: "bg-slate-300 text-white cursor-not-allowed",
    },
  };

  return (
    <button
      type="button"
      disabled={state === "disabled"}
      className={`${base} ${styles[variant][state]}`}
    >
      {variant === "ai" ? <Sparkles className="h-4 w-4" strokeWidth={2} /> : null}
      {children}
    </button>
  );
}

function ButtonsSection() {
  const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "ai"];
  const states: ButtonState[] = ["default", "hover", "disabled"];

  const labels: Record<ButtonVariant, string> = {
    primary: "Créer mon compte",
    secondary: "Découvrir les tarifs",
    ghost: "Plus tard",
    ai: "Générer avec l'IA",
  };

  return (
    <Section
      title="Boutons"
      description="4 variantes × 3 états. Padding 12/20, radius 12px (rounded-xl), texte 15/Medium."
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
                    {labels[variant]}
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
          ? "border-2 border-blue-700 shadow-[0_0_0_1px_rgba(29,78,216,0.10),0_8px_32px_-8px_rgba(29,78,216,0.35)]"
          : "border border-slate-200"
      }`}
    >
      {featured ? (
        <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-blue-700">
          Recommandé
        </span>
      ) : null}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-blue-700">
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
          icon={Sparkles}
          title="Plan généré par IA"
          description="Pour les modèles rares, l'IA Mistral propose un plan complet en 10 s."
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

type BadgeVariant = "success" | "warning" | "danger" | "info" | "ai";

function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: ReactNode;
}) {
  const styles: Record<
    BadgeVariant,
    { bg: string; dot: string; text: string; border: string }
  > = {
    success: {
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
      text: "text-emerald-800",
      border: "border-emerald-200",
    },
    warning: {
      bg: "bg-amber-50",
      dot: "bg-amber-500",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    danger: {
      bg: "bg-red-50",
      dot: "bg-red-500",
      text: "text-red-800",
      border: "border-red-200",
    },
    info: {
      bg: "bg-sky-50",
      dot: "bg-sky-500",
      text: "text-sky-800",
      border: "border-sky-200",
    },
    ai: {
      bg: "bg-gradient-to-br from-violet-50 to-indigo-50",
      dot: "bg-violet-500",
      text: "text-violet-800",
      border: "border-violet-200",
    },
  };

  const s = styles[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${s.bg} ${s.text} ${s.border}`}
    >
      {variant === "ai" ? (
        <Sparkles className="h-3 w-3" strokeWidth={2} />
      ) : (
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      )}
      {children}
    </span>
  );
}

function BadgesSection() {
  return (
    <Section
      title="Badges de statut"
      description="Statuts entretien (à jour, à anticiper, en retard, à prévoir) et source du template (IA · constructeur)."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">À jour</Badge>
          <Badge variant="warning">À anticiper</Badge>
          <Badge variant="danger">En retard</Badge>
          <Badge variant="info">À prévoir</Badge>
          <Badge variant="ai">Plan généré par IA</Badge>
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
        className={`h-11 rounded-xl bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none ${ring[state]}`}
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
        <Input label="Focus" placeholder="Marque du véhicule" state="focus" />
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

// ─────────────────────────────────────────────────────────────────────────────
//  Modals (useConfirm — 5 variantes)
// ─────────────────────────────────────────────────────────────────────────────

type DialogVariant = "info" | "success" | "warning" | "danger" | "ai";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const dialogConfig: Record<
  DialogVariant,
  {
    icon: IconType;
    bg: string;
    text: string;
    border: string;
    button: string;
    label: string;
  }
> = {
  info: {
    icon: Info,
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    button: "bg-sky-500 hover:bg-sky-600",
    label: "variant: info",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    button: "bg-emerald-500 hover:bg-emerald-600",
    label: "variant: success",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    button: "bg-amber-500 hover:bg-amber-600",
    label: "variant: warning",
  },
  danger: {
    icon: Trash2,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    button: "bg-red-500 hover:bg-red-600",
    label: "variant: danger",
  },
  ai: {
    icon: Sparkles,
    bg: "bg-gradient-to-br from-violet-50 to-indigo-50",
    text: "text-violet-700",
    border: "border-violet-200",
    button: "bg-gradient-to-br from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600",
    label: "variant: ai",
  },
};

function DialogCard({
  variant,
  title,
  description,
  confirmText,
}: {
  variant: DialogVariant;
  title: string;
  description: string;
  confirmText: string;
}) {
  const cfg = dialogConfig[variant];
  const Icon = cfg.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.12),0_4px_8px_rgba(15,23,42,0.04)]">
      <div className="flex gap-3 p-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-4 pb-4">
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Annuler
        </button>
        <button
          type="button"
          className={`rounded-xl px-3.5 py-2 text-xs font-medium text-white ${cfg.button}`}
        >
          {confirmText}
        </button>
      </div>
      <div
        className={`border-t px-3 py-1.5 font-mono text-[11px] ${cfg.bg} ${cfg.text} ${cfg.border}`}
      >
        {cfg.label}
      </div>
    </div>
  );
}

function ModalsSection() {
  return (
    <Section
      title="Modales contextuelles"
      description="5 variantes du hook useConfirm() partagé : info, success, warning, danger, ai. Remplace tous les window.confirm()."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DialogCard
          variant="success"
          title="Marquer comme à jour ?"
          description="Toutes les révisions périodiques seront considérées effectuées au kilométrage actuel."
          confirmText="Confirmer"
        />
        <DialogCard
          variant="warning"
          title="Kilométrage inférieur au compteur"
          description="Vous saisissez une valeur plus basse que la précédente. Continuer ?"
          confirmText="Confirmer quand même"
        />
        <DialogCard
          variant="danger"
          title="Supprimer Yamaha MT-07 ?"
          description="Le véhicule et tout son historique seront effacés. Action irréversible."
          confirmText="Supprimer définitivement"
        />
        <DialogCard
          variant="ai"
          title="Générer un plan personnalisé ?"
          description="L'IA analyse votre véhicule et propose un plan d'entretien complet. ~10 secondes."
          confirmText="Lancer la génération"
        />
        <DialogCard
          variant="info"
          title="Exporter votre dossier ?"
          description="Le dossier complet sera téléchargé au format JSON, ZIP ou PDF selon votre choix."
          confirmText="Continuer"
        />
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Pricing (plans Mollie en production)
// ─────────────────────────────────────────────────────────────────────────────

function PriceCard({
  name,
  price,
  yearly,
  vehicles,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  yearly?: string;
  vehicles: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-6 ${
        featured
          ? "border-2 border-blue-700 bg-gradient-to-b from-white to-slate-50 shadow-[0_0_0_1px_rgba(29,78,216,0.10),0_8px_32px_-8px_rgba(29,78,216,0.35)]"
          : "border border-slate-200 bg-white"
      } relative`}
    >
      {featured ? (
        <span className="absolute -top-2.5 right-4 inline-flex items-center rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Recommandé
        </span>
      ) : null}
      <p
        className={`text-xs font-medium uppercase tracking-wider ${
          featured ? "text-blue-700" : "text-slate-500"
        }`}
      >
        {name}
      </p>
      <p className="font-mono text-3xl font-semibold tracking-tight text-slate-900">
        {price}
      </p>
      <p className="font-mono text-xs text-slate-500">{vehicles}</p>
      {yearly ? (
        <p
          className={`font-mono text-[11px] ${
            featured ? "text-blue-700" : "text-slate-600"
          }`}
        >
          {yearly}
        </p>
      ) : null}
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
              strokeWidth={2}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingSection() {
  return (
    <Section
      title="Plans &amp; tarification"
      description="3 plans facturés via Mollie (SEPA + carte). Annulation immédiate, pas d'engagement."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <PriceCard
          name="Free"
          price="0 €"
          vehicles="/ mois · 1 véhicule"
          features={[
            "Plan d'entretien intelligent",
            "Export JSON / ZIP / PDF",
            "PWA installable",
          ]}
        />
        <PriceCard
          name="Premium"
          price="3,99 €"
          yearly="ou 39 €/an · -18 %"
          vehicles="/ mois · 5 véhicules"
          featured
          features={[
            "Tout du plan Free",
            "Plan d'entretien IA (Mistral)",
            "Support prioritaire",
          ]}
        />
        <PriceCard
          name="Family"
          price="6,99 €"
          yearly="ou 69 €/an · -18 %"
          vehicles="/ mois · 15 véhicules"
          features={[
            "Tout du plan Premium",
            "Partage familial (V1)",
            "15 véhicules suivis",
          ]}
        />
      </div>
    </Section>
  );
}
