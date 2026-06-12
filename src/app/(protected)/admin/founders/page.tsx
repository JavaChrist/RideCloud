import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { FounderMember, FounderQuestionnaireResponse, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Admin · Membres Fondateurs · RideCloud",
  description: "Tableau de bord interne du programme Membres Fondateurs."
};

// Pas de cache : on veut toujours voir l'état frais.
export const dynamic = "force-dynamic";

type FounderRow = FounderMember & {
  email: string | null;
  response: FounderQuestionnaireResponse | null;
};

async function loadData(): Promise<{
  total: number;
  pending: number;
  completed: number;
  expired: number;
  rows: FounderRow[];
}> {
  const admin = createAdminClient();

  // 1) Tous les membres fondateurs (max 100, requête simple)
  const { data: members, error: membersError } = await admin
    .from("founder_members")
    .select("user_id, slot, joined_at, status, completed_at, premium_lifetime, badge")
    .order("slot", { ascending: true });
  if (membersError) {
    console.error("[admin/founders] members error", membersError);
    return { total: 0, pending: 0, completed: 0, expired: 0, rows: [] };
  }
  const membersRows = (members ?? []) as unknown as FounderMember[];

  if (membersRows.length === 0) {
    return { total: 0, pending: 0, completed: 0, expired: 0, rows: [] };
  }

  const userIds = membersRows.map((m) => m.user_id);

  // 2) Emails depuis profiles (en bypass RLS)
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .in("id", userIds);
  const profilesRows = (profiles ?? []) as unknown as Pick<Profile, "id" | "email">[];
  const emailByUser = new Map(profilesRows.map((p) => [p.id, p.email]));

  // 3) Réponses au questionnaire
  const { data: responses } = await admin
    .from("founder_questionnaire_responses")
    .select("id, user_id, slot, usage, nps, frustration, top_feature, pricing, submitted_at")
    .in("user_id", userIds);
  const responsesRows = (responses ?? []) as unknown as FounderQuestionnaireResponse[];
  const responseByUser = new Map(responsesRows.map((r) => [r.user_id, r]));

  const rows: FounderRow[] = membersRows.map((m) => ({
    ...m,
    email: emailByUser.get(m.user_id) ?? null,
    response: responseByUser.get(m.user_id) ?? null
  }));

  return {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    completed: rows.filter((r) => r.status === "completed").length,
    expired: rows.filter((r) => r.status === "expired").length,
    rows
  };
}

export default async function AdminFoundersPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    notFound();
  }

  const data = await loadData();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
          <Sparkles className="mr-1 h-3 w-3" /> Admin · Programme Fondateurs
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Membres Fondateurs</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Vue interne — visible uniquement aux emails listés dans {" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">ADMIN_EMAILS</code>.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Total" value={data.total} tone="indigo" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="En attente" value={data.pending} tone="amber" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Complété" value={data.completed} tone="emerald" />
        <StatCard icon={<XCircle className="h-4 w-4" />} label="Expiré" value={data.expired} tone="rose" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Liste des 100 places</CardTitle>
          <CardDescription>Triées par numéro de slot. Réponses détaillées dépliables.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.rows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucun Membre Fondateur enregistré pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {data.rows.map((row) => (
                <FounderRowCard key={row.user_id} row={row} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data.rows.some((r) => r.response) && (
        <NpsBreakdown rows={data.rows} />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "indigo" | "amber" | "emerald" | "rose";
}) {
  const toneClass = {
    indigo: "from-blue-500/15 via-indigo-500/20 to-violet-500/15 text-indigo-700 dark:text-indigo-300",
    amber: "from-amber-400/15 via-amber-500/20 to-orange-500/15 text-amber-700 dark:text-amber-300",
    emerald: "from-emerald-400/15 via-emerald-500/20 to-teal-500/15 text-emerald-700 dark:text-emerald-300",
    rose: "from-rose-400/15 via-rose-500/20 to-pink-500/15 text-rose-700 dark:text-rose-300"
  }[tone];

  return (
    <Card className={`bg-gradient-to-br ${toneClass}`}>
      <CardContent className="flex items-center gap-3 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/40 backdrop-blur-sm dark:bg-slate-950/40">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FounderRowCard({ row }: { row: FounderRow }) {
  const statusBadge =
    row.status === "completed"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : row.status === "expired"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";

  return (
    <details className="group rounded-lg border border-slate-200 bg-white/60 p-3 transition open:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900/40 dark:open:bg-indigo-950/20">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-sm font-bold text-white">
            #{row.slot}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {row.email ?? "(email indisponible)"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rejoint le {new Date(row.joined_at).toLocaleDateString("fr-FR")}
              {row.completed_at && (
                <> · Complété le {new Date(row.completed_at).toLocaleDateString("fr-FR")}</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusBadge}>
            {row.status}
          </Badge>
          {row.premium_lifetime && (
            <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
              Premium à vie
            </Badge>
          )}
        </div>
      </summary>

      {row.response ? (
        <div className="mt-3 space-y-3 border-t border-slate-200 pt-3 text-sm dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">NPS</span>
            <span>
              <strong className="text-lg">{row.response.nps}</strong> / 10
            </span>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Usage</span>
            <p className="whitespace-pre-wrap">{row.response.usage}</p>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Frustration</span>
            <p className="whitespace-pre-wrap">{row.response.frustration}</p>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top feature</span>
            <p className="whitespace-pre-wrap">{row.response.top_feature}</p>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing</span>
            <p className="font-mono text-xs">{row.response.pricing}</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Pas encore de réponse au questionnaire.
        </p>
      )}
    </details>
  );
}

function NpsBreakdown({ rows }: { rows: FounderRow[] }) {
  const scores = rows
    .map((r) => r.response?.nps)
    .filter((n): n is number => typeof n === "number");
  if (scores.length === 0) return null;

  const avg = scores.reduce((s, n) => s + n, 0) / scores.length;
  const promoters = scores.filter((s) => s >= 9).length;
  const passives = scores.filter((s) => s >= 7 && s <= 8).length;
  const detractors = scores.filter((s) => s <= 6).length;
  const nps = Math.round(((promoters - detractors) / scores.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synthèse NPS</CardTitle>
        <CardDescription>Calculé sur {scores.length} réponse{scores.length > 1 ? "s" : ""}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard icon={<Sparkles className="h-4 w-4" />} label="NPS" value={nps} tone="indigo" />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Promoteurs (9-10)" value={promoters} tone="emerald" />
          <StatCard icon={<Clock className="h-4 w-4" />} label="Passifs (7-8)" value={passives} tone="amber" />
          <StatCard icon={<XCircle className="h-4 w-4" />} label="Détracteurs (0-6)" value={detractors} tone="rose" />
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Note moyenne : <strong>{avg.toFixed(1)} / 10</strong>
        </p>
      </CardContent>
    </Card>
  );
}
