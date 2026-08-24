import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Smartphone,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/components/layout/landing-header";

export const metadata = {
  title: "RideCloud — Le carnet d'entretien intelligent de tous vos véhicules",
  description:
    "Centralisez l'entretien, les coûts et les documents de vos véhicules. Plan d'entretien intelligent, rappels, exports portables. PWA française premium, hébergée en Europe.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased">
      <BackgroundDecor />
      <LandingHeader />
      <main className="relative">
        <Hero />
        <SocialProof />
        <Features />
        <Benefits />
        <FreemiumCTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Background decor — gradient mesh + subtle grid (page-wide ambient layer)
 * ──────────────────────────────────────────────────────────────────────────── */

function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-90" />
      <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid dark:bg-ride-grid-light bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Hero — high-impact entry with floating glassmorphism elements
 * ──────────────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex animate-fade-in-up">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-blue-200/70 dark:border-blue-900/70 bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-ride-xs backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-blue-500" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
              </span>
              Disponible maintenant · 1 véhicule offert
            </Badge>
          </div>

          <h1
            className="ride-text-balance mt-6 animate-fade-in-up text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl md:text-[64px]"
            style={{ animationDelay: "80ms" }}
          >
            Le carnet d&apos;entretien intelligent
            <br className="hidden sm:block" />{" "}
            <span className="bg-ride-gradient-text bg-clip-text text-transparent [background-size:200%_auto] animate-shimmer">
              de tous vos véhicules.
            </span>
          </h1>

          <p
            className="ride-text-balance mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            Centralisez, anticipez, valorisez. RideCloud suit la vie complète
            de vos véhicules — voiture, moto, scooter, utilitaire — dans une
            application web et mobile pensée pour le quotidien.
          </p>

          <div
            className="mt-10 flex w-full min-w-0 animate-fade-in-up flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Button
              asChild
              size="lg"
              className="group/cta relative h-12 w-full max-w-sm overflow-hidden whitespace-normal bg-ride-gradient-primary px-5 text-sm text-white shadow-ride-glow transition-all duration-300 hover:shadow-ride-float hover:brightness-110 sm:h-12 sm:w-auto sm:max-w-none sm:whitespace-nowrap sm:px-8 sm:text-base"
            >
              <Link href="/register">
                <span className="relative z-10 inline-flex min-w-0 items-center justify-center gap-2">
                  Commencer gratuitement
                  <ArrowRight
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity duration-500 group-hover/cta:opacity-100"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="group/cta h-12 w-full max-w-sm whitespace-normal px-5 text-sm text-slate-700 hover:bg-white/60 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900/60 dark:hover:text-slate-50 sm:w-auto sm:max-w-none sm:whitespace-nowrap sm:px-8 sm:text-base"
            >
              <a href="#features">
                Découvrir l&apos;application
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </a>
            </Button>
          </div>

          <p
            className="mt-6 animate-fade-in-up text-sm text-slate-500 dark:text-slate-400"
            style={{ animationDelay: "320ms" }}
          >
            Sans carte bancaire · 1 véhicule offert · Vos données restent les vôtres
          </p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Dashboard preview — premium mockup with floating glass cards
 * ──────────────────────────────────────────────────────────────────────────── */

function DashboardPreview() {
  return (
    <div
      className="relative mx-auto mt-20 max-w-5xl animate-fade-in-up"
      style={{ animationDelay: "400ms" }}
    >
      {/* Outer glow */}
      <div
        aria-hidden
        className="absolute -inset-x-8 -inset-y-8 -z-10 rounded-[2.5rem] bg-ride-mesh opacity-70 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -inset-x-2 -inset-y-2 -z-10 rounded-[1.75rem] bg-gradient-to-b from-blue-700/20 via-indigo-500/10 to-transparent blur-xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-ride-xl backdrop-blur-sm">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 dark:from-slate-950/80 to-white dark:to-slate-900 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-4 flex h-6 max-w-xs flex-1 items-center rounded-md bg-white dark:bg-slate-900 px-3 font-mono text-[11px] text-slate-400 dark:text-slate-500 ring-1 ring-slate-200/70 dark:ring-slate-800">
            ridecloud.app/vehicule/peugeot-3008
          </div>
          <div className="ml-auto hidden items-center gap-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Synchronisé
            </span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
          {/* Vehicle card */}
          <div className="md:col-span-1">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-ride-gradient-card p-5 shadow-ride-xs">
              <Badge className="mb-3 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-blue-700 dark:text-blue-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                Voiture
              </Badge>
              <h3 className="text-lg font-semibold tracking-tight">
                Peugeot 3008
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">2022 · 42 180 km</p>

              <Separator className="my-4" />

              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Prochain entretien
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                Vidange moteur
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300 ring-1 ring-amber-200/60 dark:ring-amber-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Bientôt dû
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">dans 820 km</span>
              </div>
            </div>
          </div>

          {/* KPI grid + history */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <KpiTile label="Ce mois" value="84,20 €" trend="-12 %" tone="ok" />
              <KpiTile label="Cette année" value="1 247 €" trend="+3 %" tone="neutral" />
              <KpiTile label="Coût / km" value="0,18 €" trend="stable" tone="neutral" />
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-ride-gradient-card shadow-ride-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Derniers entretiens
                </p>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Historique
                </span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                <HistoryRow icon={Wrench} title="Plaquettes de frein" date="12 mars 2026" km="41 850 km" cost="218 €" />
                <HistoryRow icon={Gauge} title="Contrôle technique" date="04 février 2026" km="40 720 km" cost="89 €" />
                <HistoryRow icon={Wrench} title="Vidange + filtre à huile" date="22 décembre 2025" km="38 410 km" cost="142 €" />
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification card — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-6 hidden w-72 animate-float-slow rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-ride-float backdrop-blur-md md:block"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-100 dark:ring-blue-900">
            <BellRing className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Rappel
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
              Vidange dans 820 km
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Peugeot 3008 · à planifier</p>
          </div>
        </div>
      </div>

      {/* Floating KPI card — bottom left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -left-4 hidden w-64 animate-float rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-ride-float backdrop-blur-md md:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-900">
            <TrendingUp className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Économie ce mois
            </p>
            <p className="font-mono text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              −12 %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  trend,
  tone,
}: {
  label: string;
  value: string;
  trend: string;
  tone: "ok" | "neutral";
}) {
  const trendColor = tone === "ok" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400";
  return (
    <div className="group/kpi relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-ride-gradient-card p-4 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-ride-md">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
        {value}
      </p>
      <p className={`mt-1 text-xs font-medium ${trendColor}`}>{trend}</p>
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100"
      />
    </div>
  );
}

function HistoryRow({
  icon: Icon,
  title,
  date,
  km,
  cost,
}: {
  icon: LucideIcon;
  title: string;
  date: string;
  km: string;
  cost: string;
}) {
  return (
    <li className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-950/70">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-indigo-100 dark:ring-indigo-900">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {date} · {km}
        </p>
      </div>
      <p className="font-mono text-sm font-medium tabular-nums text-slate-900 dark:text-slate-50">
        {cost}
      </p>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Social proof strip
 * ──────────────────────────────────────────────────────────────────────────── */

function SocialProof() {
  const stats = [
    { label: "Catégories supportées", value: "4" },
    { label: "Formats d'export", value: "3" },
    { label: "Hébergé en", value: "Europe" },
    { label: "Conforme", value: "RGPD" },
  ];

  return (
    <section className="relative border-y border-slate-200/70 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-6 py-10 sm:grid-cols-4 sm:gap-x-8">
        {stats.map((s) => (
          <div key={s.label} className="group text-center">
            <p className="bg-ride-gradient-text bg-clip-text text-2xl font-semibold tracking-tight text-transparent [background-size:200%_auto] sm:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-200">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Features
 * ──────────────────────────────────────────────────────────────────────────── */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Wrench,
    title: "Carnet d'entretien intelligent",
    description:
      "Plan d'entretien généré automatiquement à partir de la marque et du modèle de votre véhicule. Un programme adapté à ce que vous conduisez réellement.",
  },
  {
    icon: Layers,
    title: "Centralisation multi-véhicules",
    description:
      "Voiture, moto, scooter, utilitaire — tout dans la même interface. Bascule fluide, vue d'ensemble immédiate, dès le MVP.",
  },
  {
    icon: BellRing,
    title: "Rappels intelligents segmentés",
    description:
      "Trois niveaux clairs : urgent, important, normal. Vous savez en un coup d'œil ce qui demande votre attention aujourd'hui.",
  },
  {
    icon: TrendingUp,
    title: "Suivi des coûts en temps réel",
    description:
      "Coût du mois, de l'année, total, au kilomètre. Pour la première fois, vous savez exactement ce que votre véhicule vous coûte.",
  },
  {
    icon: FileText,
    title: "Documents centralisés",
    description:
      "Carte grise, assurance, factures, contrôle technique. Stockés en sécurité, accessibles partout, en quelques secondes.",
  },
  {
    icon: Download,
    title: "Export & import portables",
    description:
      "Vos données vous appartiennent. Export JSON, ZIP ou PDF à tout moment. Aucun verrouillage, aucune dépendance.",
  },
  {
    icon: ShieldCheck,
    title: "Passeport numérique du véhicule",
    description:
      "À la revente, transmettez un dossier complet, propre, daté. Le véhicule conserve sa valeur. L'acheteur sait ce qu'il achète.",
  },
  {
    icon: Smartphone,
    title: "PWA installable",
    description:
      "Pas de store, pas d'attente. Installation en 3 secondes sur iOS, Android et desktop. Plein écran, mises à jour automatiques.",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 rounded-full border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-slate-600 dark:text-slate-300 shadow-ride-xs backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-blue-700 dark:text-blue-300" strokeWidth={2.5} />
            Fonctionnalités
          </Badge>
          <h2 className="ride-text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-[44px]">
            Tout ce qu&apos;un carnet papier ne fera jamais.
          </h2>
          <p className="ride-text-balance mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Huit fonctionnalités pensées pour remplacer le classeur de
            factures, le carnet oublié chez le garagiste et les rappels
            manuels sur smartphone.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-slate-200/80 dark:border-slate-800 bg-ride-gradient-card shadow-ride-xs transition-all duration-500 ease-ride-spring hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-ride-lg">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(29,78,216,0.07),transparent_60%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <CardContent className="p-6">
        <div className="relative mb-5 inline-flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-blue-50 dark:to-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-100/80 dark:ring-blue-900 transition-all duration-500 group-hover:bg-ride-gradient-primary group-hover:text-white group-hover:shadow-ride-glow-sm group-hover:ring-blue-700/30">
            <Icon className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.9} />
          </div>
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Benefits
 * ──────────────────────────────────────────────────────────────────────────── */

const BENEFITS = [
  {
    title: "Vous reprenez le contrôle",
    description:
      "Plus d'oubli, plus de doute. Un seul endroit où tout est à jour : historique, échéances, documents officiels.",
  },
  {
    title: "Vous gagnez du temps",
    description:
      "Ajouter un entretien : 30 secondes. Retrouver une facture : 2 secondes. Préparer une revente : un export.",
  },
  {
    title: "Vous comprenez vos coûts",
    description:
      "Coût mensuel, annuel, au kilomètre. Sans tableur, sans saisie manuelle, sans surprise.",
  },
  {
    title: "Vous valorisez à la revente",
    description:
      "Un dossier complet et propre justifie un prix. Les acheteurs paient pour de la transparence.",
  },
  {
    title: "Vous déléguez la charge mentale",
    description:
      "Une, deux, cinq voitures dans le foyer ? Le suivi devient automatique. Le cerveau respire.",
  },
  {
    title: "Vos données vous suivent",
    description:
      "Export à tout moment. Aucune dépendance. C'est votre dossier, votre véhicule, votre histoire.",
  },
];

function Benefits() {
  return (
    <section id="benefits" className="relative border-t border-slate-200/70 dark:border-slate-800 bg-gradient-to-b from-white dark:from-slate-900 via-white dark:via-slate-900 to-slate-50/60 dark:to-slate-950/60">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Badge
              variant="outline"
              className="mb-4 gap-1.5 rounded-full border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-slate-600 dark:text-slate-300 shadow-ride-xs backdrop-blur"
            >
              <Sparkles className="h-3 w-3 text-blue-700 dark:text-blue-300" strokeWidth={2.5} />
              Bénéfices
            </Badge>
            <h2 className="ride-text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-[44px]">
              La différence se voit dès la première minute.
            </h2>
            <p className="ride-text-balance mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Elle se confirme à chaque ouverture. Ce que RideCloud change
              vraiment dans le quotidien de ceux qui possèdent un ou plusieurs
              véhicules.
            </p>
          </div>

          <ul className="space-y-1">
            {BENEFITS.map((b, idx) => (
              <li
                key={b.title}
                className="group/benefit relative flex gap-5 rounded-2xl p-5 transition-all duration-300 ease-ride-spring hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900 hover:shadow-ride-md"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-5 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-700/40 to-transparent transition-transform duration-500 group-hover/benefit:scale-x-100"
                />
                <div className="shrink-0">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-ride-xs transition-all duration-300 group-hover/benefit:border-transparent group-hover/benefit:bg-ride-gradient-primary group-hover/benefit:text-white group-hover/benefit:shadow-ride-glow-sm">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {b.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Freemium CTA — high-impact gradient card with grid pattern
 * ──────────────────────────────────────────────────────────────────────────── */

const FREEMIUM_PERKS = [
  "Plan Free : 1 véhicule, sans carte bancaire, à vie",
  "Plan Premium : 5 véhicules, plan d'entretien intelligent",
  "Plan Family : 10 véhicules pour tout le foyer",
  "Sans engagement · Annulation en 1 clic",
  "Données hébergées en Europe · RGPD natif",
];

function FreemiumCTA() {
  return (
    <section id="commencer" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-ride-gradient-dark px-8 py-14 shadow-ride-xl md:px-14 md:py-20">
          {/* Soft glow accents */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-glow-pulse rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 animate-glow-pulse rounded-full bg-indigo-400/25 blur-3xl"
            style={{ animationDelay: "1.5s" }}
          />
          {/* Grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-ride-grid-light bg-ride-grid"
          />
          {/* Top highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Badge className="mb-5 gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white backdrop-blur hover:bg-white/10">
                <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                À partir de 0 € · 3,99 €/mois en Premium
              </Badge>
              <h2 className="ride-text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-[48px]">
                Démarrez en 30 secondes. Évoluez quand votre flotte grandit.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
                Créez votre compte gratuitement avec 1 véhicule offert. Passez Premium
                ou Family quand votre garage s&apos;étoffe — annulation en un clic,
                sans frais cachés.
              </p>

              <div className="mt-8 flex w-full min-w-0 flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group/cta relative h-12 w-full max-w-sm overflow-hidden whitespace-normal bg-white px-5 text-sm text-blue-700 shadow-ride-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ride-float sm:w-auto sm:max-w-none sm:whitespace-nowrap sm:px-8 sm:text-base"
                >
                  <Link href="/register">
                    <span className="relative z-10 inline-flex items-center gap-2">
                      Commencer gratuitement
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                        strokeWidth={2.5}
                      />
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50 to-blue-50/0 opacity-0 transition-opacity duration-500 group-hover/cta:opacity-100"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 px-6 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/tarifs">Voir les tarifs</Link>
                </Button>
              </div>

              <p className="mt-5 text-sm text-blue-100/80">
                Aucune carte bancaire pour démarrer · Sans engagement ·
                Annulation en 1 clic
              </p>
            </div>

            <ul className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-ride-inner backdrop-blur-md">
              {FREEMIUM_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-200"
                    strokeWidth={2}
                  />
                  <span className="text-[15px] leading-relaxed text-white">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FAQ
 * ──────────────────────────────────────────────────────────────────────────── */

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Qu'est-ce que RideCloud, concrètement ?",
    answer:
      "Une application web et mobile (PWA) qui centralise l'entretien, les coûts et les documents de tous vos véhicules. Elle remplace le carnet papier, le classeur de factures et les rappels manuels par une expérience unifiée et intelligente.",
  },
  {
    question: "Sur quels véhicules fonctionne RideCloud ?",
    answer:
      "Toutes les catégories sont supportées dès maintenant : voitures, motos, scooters, utilitaires. Vous pouvez en suivre plusieurs en parallèle, sans limite dans les plans payants à venir.",
  },
  {
    question: "Faut-il télécharger une application sur un store ?",
    answer:
      "Non. RideCloud est une PWA — une application web installable directement depuis votre navigateur, sur iOS, Android et desktop. Installation en quelques secondes, mises à jour automatiques, aucun store.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Oui. RideCloud est hébergé en Europe (Supabase, région UE), conforme au RGPD par conception. Chaque utilisateur ne voit que ses propres données grâce à des règles de sécurité Postgres strictes (Row Level Security). Vos documents sont stockés avec des permissions dédiées.",
  },
  {
    question: "Puis-je récupérer mes données si je quitte le service ?",
    answer:
      "À tout moment. Vous exportez l'intégralité de vos dossiers véhicules en JSON, ZIP ou PDF. Aucun verrouillage. C'est un engagement fort de RideCloud : vos données vous appartiennent.",
  },
  {
    question: "Combien coûte RideCloud ?",
    answer:
      "Le plan Free vous offre 1 véhicule gratuit, sans carte bancaire, à vie. Le plan Premium est à 3,99 €/mois (5 véhicules), le plan Family à 7,99 €/mois (10 véhicules). Voir la page Tarifs pour les détails et l'option annuelle (−18 %).",
  },
  {
    question: "Mon véhicule (marque ou modèle peu courant) est-il supporté ?",
    answer:
      "Le plan d'entretien intelligent fonctionne avec une bibliothèque de templates par marque et modèle, complétée par un système de fallback par catégorie pour couvrir tous les cas. Plus de 200 modèles seront couverts au lancement public, avec une extension continue.",
  },
  {
    question: "Puis-je partager un véhicule avec mon conjoint ou ma famille ?",
    answer:
      "Le partage multi-utilisateurs par véhicule est prévu dans la V1 (3 à 6 mois). Le plan Family permettra un partage complet entre 4 comptes.",
  },
  {
    question: "RideCloud fonctionne-t-il hors connexion ?",
    answer:
      "Oui, en mode progressif. L'application PWA met en cache les données consultées récemment. Un mode hors-ligne complet et robuste arrive dans la V1.",
  },
  {
    question: "Comment RideCloud gère-t-il la revente d'un véhicule ?",
    answer:
      "Vous exportez le dossier complet (historique, factures, modifications, documents) en PDF pour l'acheteur, ou en JSON pour qu'il l'importe directement dans son propre compte RideCloud. Le véhicule conserve son histoire — et sa valeur.",
  },
  {
    question: "Y a-t-il une version pour les indépendants ou les petites flottes ?",
    answer:
      "Le plan RideCloud Pro est prévu pour les indépendants et TPE gérant jusqu'à une dizaine de véhicules, avec rôles, export comptable et API. Il sera activé à T+6 mois après l'ouverture publique.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="relative border-t border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <div className="text-center">
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 rounded-full border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1 text-slate-600 dark:text-slate-300 shadow-ride-xs"
          >
            <Sparkles className="h-3 w-3 text-blue-700 dark:text-blue-300" strokeWidth={2.5} />
            FAQ
          </Badge>
          <h2 className="ride-text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-[44px]">
            Questions fréquentes
          </h2>
          <p className="ride-text-balance mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Tout ce que vous voulez savoir avant de créer votre compte.
          </p>
        </div>

        <div className="mt-14 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-ride-gradient-card shadow-ride-sm backdrop-blur-sm">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} faq={faq} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Vous avez une autre question ?{" "}
          <a
            href="mailto:hello@ridecloud.app"
            className="font-medium text-blue-700 dark:text-blue-300 underline-offset-4 hover:underline"
          >
            Écrivez-nous
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function FaqItem({ faq }: { faq: { question: string; answer: string } }) {
  return (
    <details className="group px-6 py-5 transition-colors duration-200 hover:bg-white/60 dark:hover:bg-slate-900/60 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
        <span className="text-base font-medium text-slate-900 dark:text-slate-50 transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300 sm:text-[17px]">
          {faq.question}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-ride-xs transition-all duration-300 group-open:rotate-180 group-open:border-blue-700 group-open:bg-ride-gradient-primary group-open:text-white group-open:shadow-ride-glow-sm">
          <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </summary>
      <p className="mt-3 pr-12 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 animate-fade-in">
        {faq.answer}
      </p>
    </details>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Footer
 * ──────────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="relative border-t border-slate-200/70 dark:border-slate-800 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-white dark:to-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/icons/RideCloud.png"
                alt="RideCloud"
                width={36}
                height={36}
                className="rounded-xl shadow-ride-glow-sm"
              />
              <span className="text-[15px] font-semibold tracking-tight">
                RideCloud
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              La vie de vos véhicules, enfin dans le cloud. Conçu en France,
              hébergé en Europe, RGPD natif.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn RideCloud"
                className="group/social flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-700/30 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-ride-glow-sm"
              >
                <LinkedInIcon className="h-4 w-4 transition-transform duration-300 group-hover/social:scale-110" />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Produit"
            links={[
              { label: "Fonctionnalités", href: "#features" },
              { label: "Bénéfices", href: "#benefits" },
              { label: "FAQ", href: "#faq" },
              { label: "Tarifs", href: "/tarifs" },
            ]}
          />
          <FooterColumn
            title="Compte"
            links={[
              { label: "Connexion", href: "/login" },
              { label: "Inscription", href: "/register" },
              { label: "Mot de passe oublié", href: "/forgot-password" },
            ]}
          />
          <FooterColumn
            title="Légal"
            links={[
              { label: "Mentions légales", href: "/mentions-legales" },
              { label: "CGU", href: "/cgu" },
              { label: "Confidentialité", href: "/confidentialite" },
              { label: "RGPD", href: "/rgpd" },
            ]}
          />
        </div>

        <Separator className="my-10 bg-slate-200 dark:bg-slate-800" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} RideCloud. Tous droits réservés.
          </p>
          <p className="font-mono">
            Conçu en France · Hébergé en Europe · RGPD natif
          </p>
        </div>
      </div>
    </footer>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group/link inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200 transition-colors hover:text-blue-700 dark:hover:text-blue-300"
            >
              <span className="bg-gradient-to-r from-blue-700 to-blue-700 bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                {link.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
