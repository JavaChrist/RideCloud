"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Crown,
  Award,
  Clock,
  ShieldCheck,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/providers/confirm-provider";
import {
  useFounderProgram,
  FOUNDER_LIMIT,
  QUESTIONNAIRE_WINDOW_DAYS
} from "@/lib/hooks/use-founder-program";

/**
 * Page d'accueil du programme Membres Fondateurs.
 * Affichage conditionnel selon l'état :
 *   - pas membre : pitch + bouton "Réserver ma place" (avec confirmation)
 *   - pending    : numéro de slot + compte à rebours + CTA questionnaire
 *   - completed  : numéro + badge + Premium à vie débloqué
 *   - expired    : message explicatif, plus de CTA
 */
export function FounderWelcome() {
  const router = useRouter();
  const confirm = useConfirm();
  const {
    loading,
    record,
    slotsTaken,
    slotsRemaining,
    status,
    daysRemaining,
    claiming,
    claim
  } = useFounderProgram();

  const [justClaimedSlot, setJustClaimedSlot] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleClaim = async () => {
    if (slotsRemaining === 0) {
      toast.error("Les 100 places fondateurs sont déjà toutes attribuées.");
      return;
    }

    const ok = await confirm({
      title: "Réserver ma place de Membre Fondateur ?",
      description: `En acceptant, vous obtenez votre numéro et ${QUESTIONNAIRE_WINDOW_DAYS} jours pour remplir un questionnaire d'environ 5 minutes. Le Premium à vie + le badge fondateur seront débloqués à la soumission.`,
      confirmText: "Réserver ma place",
      cancelText: "Plus tard",
      variant: "ai"
    });

    if (!ok) return;

    const result = await claim();
    if (result.ok) {
      if (result.alreadyMember) {
        toast.info(`Vous êtes déjà Membre Fondateur #${result.slot}.`);
      } else {
        toast.success(`Bienvenue Fondateur #${result.slot} !`);
        setJustClaimedSlot(result.slot ?? null);
      }
    } else if (result.reason === "program_full") {
      toast.error("Les 100 places sont déjà toutes attribuées. Désolé !");
    } else {
      toast.error("Impossible de réserver votre place pour le moment.");
    }
  };

  // ----- État : pas encore membre → pitch
  if (!record) {
    return (
      <PitchView
        slotsTaken={slotsTaken}
        slotsRemaining={slotsRemaining}
        claiming={claiming}
        onClaim={handleClaim}
      />
    );
  }

  // ----- État : membre, complétion connue
  return (
    <MemberView
      slot={record.slot}
      status={status ?? record.status}
      daysRemaining={daysRemaining ?? 0}
      premiumLifetime={record.premiumLifetime}
      badge={record.badge}
      justClaimedSlot={justClaimedSlot}
      onContinue={() => router.push("/fondateur/questionnaire")}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

interface PitchViewProps {
  slotsTaken: number;
  slotsRemaining: number;
  claiming: boolean;
  onClaim: () => void;
}

function PitchView({ slotsTaken, slotsRemaining, claiming, onClaim }: PitchViewProps) {
  const isFull = slotsRemaining === 0;
  const progressPct = Math.round((slotsTaken / FOUNDER_LIMIT) * 100);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-indigo-200/60 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:border-indigo-800/60 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="mr-1 h-3 w-3" /> Programme limité
            </Badge>
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {slotsRemaining} place{slotsRemaining > 1 ? "s" : ""} restante{slotsRemaining > 1 ? "s" : ""}
            </Badge>
          </div>

          <CardTitle className="text-2xl font-bold sm:text-3xl">
            Devenez un Membre Fondateur RideCloud
          </CardTitle>
          <CardDescription className="text-base text-slate-700 dark:text-slate-300">
            Les 100 premiers utilisateurs qui prennent le temps de nous donner leur avis
            obtiennent <strong className="font-semibold text-indigo-700 dark:text-indigo-300">Premium à vie</strong> gratuitement,
            un <strong className="font-semibold">badge Fondateur</strong> dans l&apos;app,
            et participent directement à la suite du produit.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>{slotsTaken} / {FOUNDER_LIMIT} fondateurs</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <BenefitTile icon={<Crown className="h-4 w-4" />} title="Premium à vie" body="Tous les véhicules, IA Mistral, exports, sans abonnement." />
            <BenefitTile icon={<Award className="h-4 w-4" />} title="Badge Fondateur" body="Numéro affiché dans l'app + reconnaissance publique." />
            <BenefitTile icon={<ShieldCheck className="h-4 w-4" />} title="Voix sur la roadmap" body="Vos retours pèsent dans les priorités produit." />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/60 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
              <Clock className="h-4 w-4 text-indigo-500" />
              Comment ça marche ?
            </p>
            <ol className="ml-6 mt-2 list-decimal space-y-1">
              <li>Vous réservez votre place (1 clic, gratuit).</li>
              <li>Vous avez {QUESTIONNAIRE_WINDOW_DAYS} jours pour remplir un questionnaire de 5 minutes.</li>
              <li>À la soumission, Premium à vie + badge Fondateur sont débloqués automatiquement.</li>
            </ol>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={onClaim}
              disabled={claiming || isFull}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl disabled:opacity-60"
            >
              {claiming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isFull ? "Programme complet" : "Réserver ma place"}
              {!isFull && !claiming && <ArrowRight className="h-4 w-4" />}
            </Button>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Idempotent — si vous avez déjà une place, on vous renvoie la vôtre.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MemberViewProps {
  slot: number;
  status: "pending" | "completed" | "expired";
  daysRemaining: number;
  premiumLifetime: boolean;
  badge: boolean;
  justClaimedSlot: number | null;
  onContinue: () => void;
}

function MemberView({
  slot,
  status,
  daysRemaining,
  premiumLifetime,
  badge,
  justClaimedSlot,
  onContinue
}: MemberViewProps) {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-indigo-200/60 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:border-indigo-800/60 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="mr-1 h-3 w-3" /> Membre Fondateur
          </Badge>

          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/40">
              #{slot}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold sm:text-3xl">
                {justClaimedSlot ? "Bienvenue dans le club !" : "Votre place est réservée"}
              </CardTitle>
              <CardDescription>
                Vous êtes le {slot}<sup>e</sup> Membre Fondateur de RideCloud.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {status === "pending" && (
            <PendingState daysRemaining={daysRemaining} onContinue={onContinue} />
          )}
          {status === "completed" && (
            <CompletedState premiumLifetime={premiumLifetime} badge={badge} />
          )}
          {status === "expired" && <ExpiredState />}
        </CardContent>
      </Card>
    </div>
  );
}

function PendingState({
  daysRemaining,
  onContinue
}: {
  daysRemaining: number;
  onContinue: () => void;
}) {
  const isUrgent = daysRemaining <= 3;
  return (
    <>
      <div
        className={`rounded-lg border p-4 text-sm ${
          isUrgent
            ? "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-100"
            : "border-indigo-200 bg-white/60 text-slate-700 dark:border-indigo-800 dark:bg-slate-900/40 dark:text-slate-300"
        }`}
      >
        <p className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4" />
          {daysRemaining === 0
            ? "Dernier jour pour remplir le questionnaire"
            : daysRemaining === 1
            ? "Il vous reste 1 jour pour remplir le questionnaire"
            : `Il vous reste ${daysRemaining} jours pour remplir le questionnaire`}
        </p>
        <p className="mt-1 text-xs opacity-80">
          Le Premium à vie + le badge se débloquent à la soumission. Comptez environ 5 minutes.
        </p>
      </div>

      <Button
        size="lg"
        onClick={onContinue}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl"
      >
        <Sparkles className="h-4 w-4" />
        Remplir le questionnaire
        <ArrowRight className="h-4 w-4" />
      </Button>
    </>
  );
}

function CompletedState({
  premiumLifetime,
  badge
}: {
  premiumLifetime: boolean;
  badge: boolean;
}) {
  return (
    <>
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-100">
        <p className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Questionnaire complété — merci pour votre retour !
        </p>
        <p className="mt-1 text-xs opacity-80">
          Vos récompenses sont actives sur votre compte.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <RewardTile
          icon={<Crown className="h-4 w-4" />}
          title="Premium à vie"
          active={premiumLifetime}
        />
        <RewardTile
          icon={<Award className="h-4 w-4" />}
          title="Badge Fondateur"
          active={badge}
        />
      </div>

      <Button asChild variant="outline">
        <Link href="/categories">Retour à mon tableau de bord</Link>
      </Button>
    </>
  );
}

function ExpiredState() {
  return (
    <>
      <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100">
        <p className="flex items-center gap-2 font-medium">
          <XCircle className="h-4 w-4" />
          Délai dépassé
        </p>
        <p className="mt-1 text-xs opacity-80">
          Les {QUESTIONNAIRE_WINDOW_DAYS} jours pour remplir le questionnaire sont écoulés.
          Le Premium à vie n&apos;a pas été débloqué — mais vous gardez votre numéro
          de fondateur dans nos archives.
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tuiles
// ---------------------------------------------------------------------------

function BenefitTile({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/15 via-indigo-500/20 to-violet-500/15 text-indigo-600 dark:text-indigo-300">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{body}</p>
    </div>
  );
}

function RewardTile({
  icon,
  title,
  active
}: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        active
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-md ${
          active
            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className={`text-xs ${active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500"}`}>
          {active ? "Actif" : "En attente"}
        </p>
      </div>
    </div>
  );
}
