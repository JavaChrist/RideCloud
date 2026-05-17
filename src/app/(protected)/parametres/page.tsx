import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  FileText,
  Mail,
  Shield,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountSection } from "@/components/account/delete-account-section";
import { SubscriptionSection } from "@/components/billing/subscription-section";
import { getUserPlanState } from "@/lib/billing/limits";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Paramètres · RideCloud",
  description: "Gérez votre compte, vos données personnelles et vos préférences."
};

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const planState = await getUserPlanState(user.id);
  const email = user.email ?? "—";
  const createdAt = user.created_at
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(user.created_at))
    : "—";

  return (
    <section className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-ride-gradient-card p-5 shadow-ride-sm md:p-7">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
        />
        <Badge
          variant="outline"
          className="mb-3 gap-1.5 rounded-full border-blue-200 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-ride-xs backdrop-blur"
        >
          <Shield className="h-3.5 w-3.5" aria-hidden />
          Compte &amp; confidentialité
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Paramètres
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
          Gérez votre compte, votre abonnement et contrôlez vos données.
        </p>
      </header>

      <SubscriptionSection state={planState} />

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 shadow-ride-xs">
              <UserRound className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Mon compte
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Informations associées à votre session RideCloud.
              </p>
            </div>
          </div>
          <Separator className="my-5 bg-slate-200/70" />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                E-mail
              </dt>
              <dd className="mt-1.5 break-all text-sm font-medium text-slate-900">{email}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Compte créé le
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-slate-900">{createdAt}</dd>
            </div>
          </dl>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-ride-xs">
              <Download className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Exporter mes données
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Téléchargez vos données par véhicule au format JSON, PDF ou ZIP depuis
                chaque fiche véhicule.
              </p>
            </div>
          </div>
          <Separator className="my-5 bg-slate-200/70" />
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 transition hover:text-blue-800"
          >
            Accéder à mes véhicules
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </article>
      </div>

      <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-ride-xs">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Vos droits RGPD
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Vous disposez à tout moment d&apos;un droit d&apos;accès, de rectification,
              d&apos;effacement, de portabilité et d&apos;opposition sur vos données
              personnelles.
            </p>
          </div>
        </div>
        <Separator className="my-5 bg-slate-200/70" />
        <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <li>
            <Link
              href="/rgpd"
              className="inline-flex items-center gap-1.5 font-medium text-blue-700 transition hover:text-blue-800"
            >
              Détail de mes droits
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </li>
          <li>
            <Link
              href="/confidentialite"
              className="inline-flex items-center gap-1.5 font-medium text-blue-700 transition hover:text-blue-800"
            >
              Politique de confidentialité
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </li>
          <li>
            <Link
              href="/cgu"
              className="inline-flex items-center gap-1.5 font-medium text-blue-700 transition hover:text-blue-800"
            >
              Conditions générales d&apos;utilisation
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </li>
          <li>
            <a
              href="mailto:support@javachrist.fr"
              className="inline-flex items-center gap-1.5 font-medium text-blue-700 transition hover:text-blue-800"
            >
              Contacter le support
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </li>
        </ul>
      </article>

      <DeleteAccountSection email={email} />
    </section>
  );
}
