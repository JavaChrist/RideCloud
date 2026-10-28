import {
  ArrowRight,
  Award,
  ClipboardList,
  MessageSquareHeart,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BETA_CLUB_MISSIONS_URL, getJavaChristDiscordInviteUrl } from "@/lib/beta-club";

const CARDS = [
  {
    icon: ClipboardList,
    title: "Des missions de test",
    body: "Participez aux campagnes disponibles selon vos appareils, vos centres d’intérêt et les prérequis de chaque mission."
  },
  {
    icon: MessageSquareHeart,
    title: "Vos retours comptent",
    body: "Signalez les difficultés, documentez les bugs et proposez vos idées pour contribuer à l’évolution des applications JavaChrist."
  },
  {
    icon: Award,
    title: "Progression et récompenses",
    body: "Vos tests validés font progresser votre niveau. Vos contributions peuvent aussi débloquer des badges et des récompenses Premium selon les conditions du Beta Club."
  }
] as const;

const STEPS = [
  "Rejoignez le Discord JavaChrist et consultez les modalités pour obtenir le rôle Testeur.",
  "Connectez-vous à JavaChrist Beta Club avec Discord et renseignez vos appareils.",
  "Choisissez une mission compatible, suivez ses consignes et envoyez votre compte-rendu.",
  "Après validation par l’équipe JavaChrist, votre test compte dans votre progression."
] as const;

export function BetaClubInvite() {
  const discordInviteUrl = getJavaChristDiscordInviteUrl();

  return (
    <section id="beta-club" className="scroll-mt-24">
      <Card className="relative overflow-hidden border-indigo-200/60 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:border-indigo-800/60 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"
        />
        <CardHeader className="space-y-3 text-center">
          <Badge
            variant="outline"
            className="mx-auto w-fit border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
          >
            <Sparkles className="mr-1 h-3 w-3" aria-hidden />
            Beta Club JavaChrist
          </Badge>
          <CardTitle className="text-2xl font-bold sm:text-3xl">
            Participez à l’amélioration de RideCloud
          </CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base text-slate-700 dark:text-slate-300">
            Rejoignez la communauté JavaChrist et découvrez les campagnes de test
            de RideCloud et de nos autres applications. Partagez votre expérience,
            proposez des améliorations et progressez grâce à vos contributions
            validées. Pas besoin d’être développeur.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/15 via-indigo-500/20 to-violet-500/15 text-indigo-600 dark:text-indigo-300">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    {card.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {card.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/60 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-slate-100">Comment ça marche ?</p>
            <ol className="ml-5 mt-2 list-decimal space-y-1.5">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            {discordInviteUrl ? (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl"
              >
                <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer">
                  Rejoindre le Beta Club sur Discord
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : (
              <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
                L’invitation Discord publique n’est pas encore configurée. Les
                membres déjà inscrits peuvent accéder aux missions ci-dessous.
              </p>
            )}

            <p className="max-w-lg text-xs text-slate-500 dark:text-slate-400">
              Les accès aux tests et les récompenses dépendent des campagnes et
              des conditions du Beta Club.
            </p>

            <a
              href={BETA_CLUB_MISSIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-indigo-700 hover:underline dark:text-slate-400 dark:hover:text-indigo-300"
            >
              Déjà membre ? Accéder aux missions
            </a>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
