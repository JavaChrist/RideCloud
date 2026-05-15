import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Car,
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

export const metadata = {
  title: "RideCloud — Le carnet d'entretien intelligent de tous vos véhicules",
  description:
    "Centralisez l'entretien, les coûts et les documents de vos véhicules. Plan d'entretien intelligent, rappels, exports portables. PWA française premium, hébergée en Europe.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <Benefits />
        <BetaCTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
            <Car className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            RideCloud
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Fonctionnalités
          </a>
          <a
            href="#benefits"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Bénéfices
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            FAQ
          </a>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Connexion
          </Link>
        </nav>

        <Button
          asChild
          size="sm"
          className="bg-blue-700 text-white shadow-sm hover:bg-blue-800"
        >
          <Link href="/register">
            Rejoindre la bêta
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(29,78,216,0.12),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 border-blue-200 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="mr-1.5 h-3 w-3" strokeWidth={2.5} />
            Pré-bêta privée · Places limitées
          </Badge>

          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-[56px]">
            Le carnet d&apos;entretien intelligent
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              de tous vos véhicules.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-slate-600 md:text-xl">
            Centralisez, anticipez, valorisez. RideCloud suit la vie complète
            de vos véhicules — voiture, moto, scooter, utilitaire — dans une
            application web et mobile pensée pour le quotidien.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-blue-700 px-6 text-base text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg sm:w-auto"
            >
              <Link href="/register">
                Rejoindre la bêta privée
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 w-full px-6 text-base text-slate-700 hover:bg-white hover:text-slate-900 sm:w-auto"
            >
              <a href="#features">
                Découvrir l&apos;application
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
              </a>
            </Button>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Sans carte bancaire · Sans engagement · Vos données restent les
            vôtres
          </p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div
        aria-hidden
        className="absolute -inset-x-4 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-b from-blue-700/10 via-indigo-500/5 to-transparent blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10">
        {/* Top bar (window chrome) */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-4 flex h-6 max-w-xs flex-1 items-center rounded-md bg-white px-3 text-[11px] font-mono text-slate-400 ring-1 ring-slate-200/70">
            ridecloud.app/vehicule/peugeot-3008
          </div>
        </div>

        {/* Dashboard content */}
        <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
          {/* Left column — vehicle card */}
          <div className="md:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <Badge className="mb-3 bg-indigo-50 text-blue-700 hover:bg-indigo-50">
                Voiture
              </Badge>
              <h3 className="text-lg font-semibold tracking-tight">
                Peugeot 3008
              </h3>
              <p className="text-sm text-slate-500">2022 · 42 180 km</p>

              <Separator className="my-4" />

              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Prochain entretien
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Vidange moteur
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Bientôt dû
                </span>
                <span className="text-xs text-slate-500">dans 820 km</span>
              </div>
            </div>
          </div>

          {/* Right column — KPIs + history */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <KpiTile label="Ce mois" value="84,20 €" trend="-12 %" tone="ok" />
              <KpiTile label="Cette année" value="1 247 €" trend="+3 %" tone="neutral" />
              <KpiTile label="Coût / km" value="0,18 €" trend="stable" tone="neutral" />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  Derniers entretiens
                </p>
                <span className="text-xs font-medium text-slate-400">
                  Historique
                </span>
              </div>
              <ul className="divide-y divide-slate-100">
                <HistoryRow
                  icon={Wrench}
                  title="Plaquettes de frein"
                  date="12 mars 2026"
                  km="41 850 km"
                  cost="218 €"
                />
                <HistoryRow
                  icon={Gauge}
                  title="Contrôle technique"
                  date="04 février 2026"
                  km="40 720 km"
                  cost="89 €"
                />
                <HistoryRow
                  icon={Wrench}
                  title="Vidange + filtre à huile"
                  date="22 décembre 2025"
                  km="38 410 km"
                  cost="142 €"
                />
              </ul>
            </div>
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
  const trendColor =
    tone === "ok" ? "text-emerald-700" : "text-slate-500";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className={`mt-1 text-xs font-medium ${trendColor}`}>{trend}</p>
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
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-blue-700">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">
          {date} · {km}
        </p>
      </div>
      <p className="font-mono text-sm font-medium tabular-nums text-slate-900">
        {cost}
      </p>
    </li>
  );
}

function SocialProof() {
  const stats = [
    { label: "Catégories supportées", value: "4" },
    { label: "Formats d'export", value: "3" },
    { label: "Hébergé en", value: "Europe" },
    { label: "Conforme", value: "RGPD" },
  ];

  return (
    <section className="border-y border-slate-200 bg-white/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-6 py-10 sm:grid-cols-4 sm:gap-x-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

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
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="mb-4 border-slate-200 bg-white text-slate-600"
          >
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[40px]">
            Tout ce qu&apos;un carnet papier ne fera jamais.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
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
    <Card className="group relative overflow-hidden rounded-2xl border-slate-200 bg-white shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

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
    <section id="benefits" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Badge
              variant="outline"
              className="mb-4 border-slate-200 bg-slate-50 text-slate-600"
            >
              Bénéfices
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[40px]">
              La différence se voit dès la première minute.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Elle se confirme à chaque ouverture. Ce que RideCloud change
              vraiment dans le quotidien de ceux qui possèdent un ou plusieurs
              véhicules.
            </p>
          </div>

          <ul className="space-y-1">
            {BENEFITS.map((b, idx) => (
              <li
                key={b.title}
                className="group flex gap-5 rounded-2xl p-5 transition-colors hover:bg-slate-50"
              >
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white font-mono text-sm font-semibold text-blue-700 transition-colors group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">
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

const BETA_PERKS = [
  "Accès anticipé complet à toutes les fonctionnalités MVP",
  "Canal direct avec l'équipe produit (Discord ou email)",
  "Influence réelle sur la roadmap des prochains mois",
  "Avantage tarifaire à vie sur les futurs plans payants",
  "Application stable, soignée et déjà fonctionnelle",
];

function BetaCTA() {
  return (
    <section id="beta" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800 px-8 py-14 shadow-xl shadow-blue-900/20 md:px-14 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:24px_24px]"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Badge className="mb-5 border border-white/20 bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1.5 h-3 w-3" strokeWidth={2.5} />
                200 à 500 places · Bêta privée
              </Badge>
              <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-[44px]">
                Rejoignez le cercle qui façonne RideCloud.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
                Nous ouvrons l&apos;accès à un cercle restreint d&apos;utilisateurs
                sélectionnés pour finaliser l&apos;expérience avant l&apos;ouverture
                publique.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-white px-6 text-base text-blue-700 shadow-md transition-all hover:bg-slate-100 hover:shadow-lg"
                >
                  <Link href="/register">
                    Demander un accès à la bêta
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 px-6 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/login">J&apos;ai déjà un compte</Link>
                </Button>
              </div>

              <p className="mt-5 text-sm text-blue-100/80">
                Aucune carte bancaire · Aucun engagement · Vous partez quand
                vous voulez
              </p>
            </div>

            <ul className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm">
              {BETA_PERKS.map((perk) => (
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
      "Pendant la bêta privée, l'accès est gratuit. À l'ouverture publique, un plan Free restera disponible (un véhicule, fonctionnalités essentielles). Les plans payants commenceront à 3,99 € par mois, avec des offres Family et Pro pour les usages plus avancés.",
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
    <section id="faq" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <div className="text-center">
          <Badge
            variant="outline"
            className="mb-4 border-slate-200 bg-slate-50 text-slate-600"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[40px]">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Tout ce que vous voulez savoir avant de rejoindre la bêta.
          </p>
        </div>

        <div className="mt-14 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/30">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} faq={faq} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Vous avez une autre question ?{" "}
          <a
            href="mailto:hello@ridecloud.app"
            className="font-medium text-blue-700 underline-offset-4 hover:underline"
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
    <details className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
        <span className="text-base font-medium text-slate-900 group-hover:text-blue-700 sm:text-[17px]">
          {faq.question}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all group-open:rotate-180 group-open:border-blue-700 group-open:bg-blue-700 group-open:text-white">
          <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </summary>
      <p className="mt-3 pr-12 text-[15px] leading-relaxed text-slate-600">
        {faq.answer}
      </p>
    </details>
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

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
                <Car className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight">
                RideCloud
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              La vie de vos véhicules, enfin dans le cloud. Conçu en France,
              hébergé en Europe, RGPD natif.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn RideCloud"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-700 hover:text-blue-700"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Produit"
            links={[
              { label: "Fonctionnalités", href: "#features" },
              { label: "Bénéfices", href: "#benefits" },
              { label: "FAQ", href: "#faq" },
              { label: "Bêta privée", href: "/register" },
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
              { label: "Mentions légales", href: "#" },
              { label: "CGU", href: "#" },
              { label: "Confidentialité", href: "#" },
              { label: "RGPD", href: "#" },
            ]}
          />
        </div>

        <Separator className="my-10 bg-slate-200" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-slate-500 sm:flex-row sm:items-center">
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

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-slate-700 transition-colors hover:text-blue-700"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
