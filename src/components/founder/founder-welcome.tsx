"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Crown,
  Award,
  Clock,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BetaClubInvite } from "@/components/beta-club/beta-club-invite";
import {
  useFounderProgram,
  QUESTIONNAIRE_WINDOW_DAYS
} from "@/lib/hooks/use-founder-program";

/**
 * Espace Fondateur existant + recrutement public.
 *   - pas membre : présentation Beta Club (plus de réservation de place)
 *   - pending / completed / expired : parcours Fondateur inchangé
 */
export function FounderWelcome() {
  const router = useRouter();
  const {
    loading,
    record,
    status,
    daysRemaining
  } = useFounderProgram();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!record) {
    return <BetaClubInvite />;
  }

  // ----- État : membre, complétion connue
  return (
    <MemberView
      slot={record.slot}
      status={status ?? record.status}
      daysRemaining={daysRemaining ?? 0}
      premiumLifetime={record.premiumLifetime}
      badge={record.badge}
      onContinue={() => router.push("/fondateur/questionnaire")}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

interface MemberViewProps {
  slot: number;
  status: "pending" | "completed" | "expired";
  daysRemaining: number;
  premiumLifetime: boolean;
  badge: boolean;
  onContinue: () => void;
}

function MemberView({
  slot,
  status,
  daysRemaining,
  premiumLifetime,
  badge,
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
                Votre place est réservée
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
