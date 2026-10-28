"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Headphones,
  Loader2,
  Mail,
  Users,
  BarChart3,
  Wrench
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/providers/confirm-provider";
import {
  buildFamilyPrioritySupportMailto,
  type HouseholdState
} from "@/lib/family/household";
import { USAGE_PROFILE_LABELS } from "@/lib/usage-profile";
import type { UserPlanState } from "@/lib/billing/limits";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  overdue: "En retard",
  due_soon: "Bientôt dû",
  upcoming: "À venir"
};

export function FamilyHouseholdSection({
  planState
}: {
  planState: UserPlanState;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const [household, setHousehold] = useState<HouseholdState | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const inviteToken = searchParams.get("invite");
  const canManage = planState.plan === "family" && planState.planStatus === "active";
  const showSection = canManage || planState.hasHouseholdBenefits || Boolean(inviteToken);

  const supportMailto = useMemo(() => {
    const ownerEmail = household?.ownerEmail ?? "";
    if (!ownerEmail) return null;
    return buildFamilyPrioritySupportMailto(ownerEmail);
  }, [household?.ownerEmail]);

  async function refresh() {
    const response = await fetch("/api/family/state");
    const data = (await response.json()) as { household?: HouseholdState; error?: string };
    if (!response.ok || !data.household) {
      throw new Error(data.error ?? "Impossible de charger le foyer.");
    }
    setHousehold(data.household);
  }

  useEffect(() => {
    if (!showSection) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void refresh()
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Foyer indisponible.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showSection]);

  useEffect(() => {
    if (!inviteToken || loading) return;
    let cancelled = false;
    setBusy(true);
    void fetch("/api/family/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: inviteToken })
    })
      .then(async (response) => {
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Invitation refusée.");
        toast.success("Vous avez rejoint le foyer Family.");
        await refresh();
        router.replace("/parametres");
        router.refresh();
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Invitation impossible.");
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteToken, loading, router]);

  if (!showSection) return null;

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/family/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = (await response.json()) as { error?: string; token?: string };
      if (!response.ok) throw new Error(data.error ?? "Invitation impossible.");
      toast.success("Invitation enregistrée. La personne la verra dans ses Paramètres.");
      setEmail("");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invitation impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAction(body: Record<string, string>) {
    const ok = await confirm({
      title: body.action === "leave" ? "Quitter le foyer ?" : "Confirmer",
      description:
        body.action === "leave"
          ? "Vous perdrez l'accès aux véhicules partagés du foyer."
          : "Cette action retire l'accès foyer.",
      confirmText: "Confirmer"
    });
    if (!ok) return;
    setBusy(true);
    try {
      const response = await fetch("/api/family/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Action impossible.");
      toast.success("Foyer mis à jour.");
      await refresh();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <article className="relative overflow-hidden rounded-3xl border border-indigo-200/70 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-6 shadow-ride-sm">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
        />
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Foyer Family
              </h2>
              <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:text-indigo-300">
                {household ? `${household.seatUsed}/${household.seatLimit} comptes` : "4 comptes"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Partagez le garage, les entretiens et les documents avec jusqu&apos;à 3 autres
              comptes. Les accès dépendent d&apos;un abonnement Family actif.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            {household?.pendingInvite && !household.householdId ? (
              <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950/30">
                <p>
                  Invitation de <strong>{household.pendingInvite.ownerEmail}</strong>
                </p>
                <Button
                  className="mt-3"
                  disabled={busy}
                  onClick={() =>
                    void fetch("/api/family/accept", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: household.pendingInvite?.token })
                    }).then(async (response) => {
                      const data = (await response.json()) as { error?: string };
                      if (!response.ok) {
                        toast.error(data.error ?? "Invitation refusée.");
                        return;
                      }
                      toast.success("Vous avez rejoint le foyer Family.");
                      await refresh();
                      router.refresh();
                    })
                  }
                >
                  Rejoindre le foyer
                </Button>
              </div>
            ) : null}

            {canManage ? (
              <form onSubmit={handleInvite} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e-mail du membre à inviter"
                  className="sm:flex-1"
                />
                <Button type="submit" disabled={busy}>
                  Inviter
                </Button>
              </form>
            ) : null}

            <ul className="mt-5 space-y-2">
              {(household?.members ?? []).map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {member.fullName || member.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.email} · {member.role === "owner" ? "Titulaire" : "Membre"}
                    </p>
                  </div>
                  {canManage && member.role !== "owner" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleAction({ action: "remove", memberUserId: member.userId })}
                    >
                      Retirer
                    </Button>
                  ) : null}
                </li>
              ))}
              {(household?.invites ?? []).map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm dark:border-slate-700"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-50">{invite.email}</p>
                    <p className="text-xs text-slate-500">
                      {invite.status === "expired" ? "Expirée" : "En attente"} · lien{" "}
                      <span className="font-mono">/parametres?invite={invite.token}</span>
                    </p>
                  </div>
                  {canManage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleAction({ action: "revoke", inviteId: invite.id })}
                    >
                      Annuler
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>

            {household?.role === "member" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                disabled={busy}
                onClick={() => void handleAction({ action: "leave" })}
              >
                Quitter le foyer
              </Button>
            ) : null}
          </>
        )}
      </article>

      {household?.isActive && household.stats ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" aria-hidden />
              <h3 className="text-base font-semibold">Statistiques foyer</h3>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
                <dt className="text-xs text-slate-500">Véhicules</dt>
                <dd className="mt-1 text-lg font-semibold">{household.stats.vehicleCount}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
                <dt className="text-xs text-slate-500">Comptes</dt>
                <dd className="mt-1 text-lg font-semibold">{household.stats.memberCount}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
                <dt className="text-xs text-slate-500">Coût {new Date().getFullYear()}</dt>
                <dd className="mt-1 text-lg font-semibold">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                    household.stats.yearCost
                  )}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50">
                <dt className="text-xs text-slate-500">Entretiens à traiter</dt>
                <dd className="mt-1 text-lg font-semibold">{household.stats.upcomingCount}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-indigo-600" aria-hidden />
              <h3 className="text-base font-semibold">Profils maintenance</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {household.stats.vehicles.length === 0 ? (
                <li className="text-slate-500">Aucun véhicule dans le foyer.</li>
              ) : (
                household.stats.vehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    <Link
                      href={`/vehicule/${vehicle.id}`}
                      className="block rounded-2xl border border-slate-200/80 px-3 py-2 transition hover:border-indigo-300 dark:border-slate-800"
                    >
                      <p className="font-medium text-slate-900 dark:text-slate-50">{vehicle.label}</p>
                      <p className="text-xs text-slate-500">
                        {USAGE_PROFILE_LABELS[vehicle.usageProfile]} · {vehicle.kilometrage.toLocaleString("fr-FR")} km
                        {vehicle.nextDueTitle
                          ? ` · ${vehicle.nextDueTitle} (${STATUS_LABELS[vehicle.nextDueStatus ?? ""] ?? vehicle.nextDueStatus})`
                          : ""}
                      </p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </article>
        </div>
      ) : null}

      {household?.isActive && supportMailto ? (
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 h-5 w-5 text-indigo-600" aria-hidden />
            <div>
              <h3 className="text-base font-semibold">Support prioritaire Family</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Votre foyer Family ouvre un canal de support identifié. Décrivez votre besoin :
                nous traitons ces messages en priorité.
              </p>
              <Button asChild className="mt-4">
                <a href={supportMailto}>
                  <Mail className="h-4 w-4" aria-hidden />
                  Contacter le support prioritaire
                </a>
              </Button>
            </div>
          </div>
        </article>
      ) : null}

      {!canManage && !planState.hasHouseholdBenefits && !household?.pendingInvite ? (
        <p className="text-sm text-slate-500">
          Le partage foyer est inclus dans le plan Family.{" "}
          <Link href="/tarifs" className="font-medium text-indigo-700 hover:underline dark:text-indigo-300">
            Voir les tarifs
          </Link>
        </p>
      ) : null}
    </section>
  );
}

export function FamilyHouseholdFallback() {
  return (
    <div className="flex justify-center rounded-3xl border border-slate-200 py-10 dark:border-slate-800">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
    </div>
  );
}
