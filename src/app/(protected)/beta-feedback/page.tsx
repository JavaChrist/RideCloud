import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { BetaFeedbackForm } from "@/components/beta/beta-feedback-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquareHeart } from "lucide-react";

export const metadata = {
  title: "Retour d'expérience bêta — RideCloud"
};

export default async function BetaFeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const planState = await getUserPlanState(user.id);

  // Si l'utilisateur n'est pas/plus bêta ou a déjà soumis, on le redirige
  if (!planState.isBeta || planState.betaFeedbackSubmitted) {
    redirect("/categories");
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card className="relative overflow-hidden rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
        />
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <MessageSquareHeart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Bêta testeur
            </Badge>
          </div>
          <CardTitle className="text-2xl">Votre retour d&apos;expérience</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Votre accès bêta a pris fin. Avant de continuer, merci de nous donner votre avis — c&apos;est la contrepartie de votre accès gratuit et c&apos;est ce qui nous permet d&apos;améliorer RideCloud.
            <br />
            <span className="mt-2 block font-medium text-slate-700 dark:text-slate-300">
              Comptez environ 3 minutes.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BetaFeedbackForm />
        </CardContent>
      </Card>
    </div>
  );
}
