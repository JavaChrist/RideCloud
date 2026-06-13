import Link from "next/link";
import { ArrowRight, Cloud, Lock, Shield, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { PricingCards } from "@/components/billing/pricing-cards";
import { Logo } from "@/components/common/logo";

export const metadata = {
  title: "Tarifs · RideCloud",
  description:
    "Découvrez les plans RideCloud : Free pour démarrer, Premium pour les multi-véhicules, Family pour le foyer. Sans engagement, hébergé en Europe."
};

export default async function TarifsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const planState = user ? await getUserPlanState(user.id) : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 1000px 400px at 50% -10%, rgba(29,78,216,0.10), transparent 70%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[420px] -z-10 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"
      />

      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="transition hover:opacity-80">
            <Logo compact />
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link
                href="/categories"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-900 dark:bg-slate-100 px-4 text-sm font-medium text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-white"
              >
                Tableau de bord
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 dark:bg-slate-100 px-4 text-sm font-medium text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-white"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 text-center md:px-6 md:pt-20">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-ride-xs backdrop-blur">
            <Cloud className="h-3.5 w-3.5" aria-hidden />
            Tarifs simples, sans engagement
          </div>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl lg:text-6xl">
            Un plan pour chaque garage.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-slate-600 dark:text-slate-300 md:text-lg">
            Démarrez gratuitement avec un véhicule. Passez Premium quand votre flotte
            s&apos;étoffe. Annulez en un clic, sans frais cachés.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
          <PricingCards
            isLoggedIn={Boolean(user)}
            currentPlan={planState?.plan ?? null}
            currentInterval={planState?.planInterval ?? null}
            hasActiveSubscription={Boolean(planState?.mollieSubscriptionId)}
          />
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Sans engagement",
                description:
                  "Annulez à tout moment depuis votre espace, le plan reste actif jusqu'à la fin de la période payée."
              },
              {
                icon: Lock,
                title: "Paiements sécurisés",
                description:
                  "Mollie (Pays-Bas, agréé PSP européen) gère les paiements. Aucune donnée carte ne transite par nos serveurs."
              },
              {
                icon: Shield,
                title: "RGPD natif",
                description:
                  "Données hébergées en Europe, droit à l'effacement immédiat depuis vos paramètres, audit RGPD public."
              }
            ].map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-ride-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-ride-xs">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-4 pb-24 md:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
            Questions fréquentes
          </h2>
          <div className="mt-8 space-y-3">
            {[
              {
                q: "Quels modes de paiement sont acceptés ?",
                a: "Carte bancaire (Visa, Mastercard) et prélèvement SEPA via Mollie. D'autres méthodes (Bancontact, iDEAL) sont disponibles selon votre pays."
              },
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui. Annulez votre abonnement courant depuis vos paramètres et souscrivez au nouveau plan. La période payée reste utilisable jusqu'à son terme."
              },
              {
                q: "Que se passe-t-il si j'annule ?",
                a: "Votre plan reste actif jusqu'à la date de prochain renouvellement. Ensuite, vous repassez automatiquement en plan Free. Vos données restent intactes — vous pouvez les exporter ou réactiver l'abonnement plus tard. À noter : le temps restant n'est pas remboursé au prorata, conformément aux CGV (vous avez expressément demandé l'activation immédiate du service au paiement)."
              },
              {
                q: "Y a-t-il une réduction pour le paiement annuel ?",
                a: "Oui, environ 18 % d'économies. Premium revient à 3,25 €/mois (39 €/an au lieu de 47,88 €) et Family à 6,58 €/mois (79 €/an au lieu de 95,88 €)."
              },
              {
                q: "L'abonnement annuel est-il remboursable si je résilie en cours d'année ?",
                a: "Non. En souscrivant, vous demandez l'activation immédiate du service et renoncez expressément à votre droit de rétractation (art. L.221-28 13° du Code de la consommation). En cas de résiliation, votre accès reste actif jusqu'à la date anniversaire annuelle, mais le temps restant n'est pas remboursé. Pensez à choisir le mensuel si vous n'êtes pas sûr."
              },
              {
                q: "TVA appliquée ?",
                a: "Non. L'éditeur (JavaChrist, EI) bénéficie de la franchise de TVA (art. 293 B du CGI). Les prix affichés sont les prix finaux."
              },
              {
                q: "Comment fonctionne le partage Family ?",
                a: "Le partage entre 4 comptes arrive dans la V1 (mi-2026). En attendant, le plan Family vous donne 10 véhicules à gérer depuis votre compte unique."
              }
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-ride-sm transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} RideCloud · Tous droits réservés</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/mentions-legales" className="transition hover:text-slate-900 dark:hover:text-slate-50">
              Mentions légales
            </Link>
            <Link href="/cgu" className="transition hover:text-slate-900 dark:hover:text-slate-50">
              CGU
            </Link>
            <Link href="/confidentialite" className="transition hover:text-slate-900 dark:hover:text-slate-50">
              Confidentialité
            </Link>
            <Link href="/rgpd" className="transition hover:text-slate-900 dark:hover:text-slate-50">
              RGPD
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
