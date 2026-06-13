"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useFounderProgram, QUESTIONNAIRE_WINDOW_DAYS } from "@/lib/hooks/use-founder-program";

const schema = z.object({
  usage: z.string().min(10, "Au moins 10 caractères, dites-nous comment vous utilisez RideCloud."),
  nps: z.number().int().min(0).max(10),
  frustration: z.string().min(5, "Au moins 5 caractères — un point bloquant ou 'aucun'."),
  topFeature: z.string().min(2, "Au moins 2 caractères."),
  pricing: z.string().min(2, "Au moins 2 caractères.")
});

type FormValues = z.infer<typeof schema>;

const PRICING_OPTIONS = [
  { value: "yes_current", label: "Oui, au prix actuel (3,99 € / mois)" },
  { value: "yes_cheaper", label: "Oui, mais moins cher" },
  { value: "no", label: "Non, je ne paierais pas" }
] as const;

export function FounderQuestionnaire() {
  const router = useRouter();
  const { loading, record, status, daysRemaining, submitting, submit } = useFounderProgram();
  const [completed, setCompleted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      usage: "",
      nps: 8,
      frustration: "",
      topFeature: "",
      pricing: ""
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Pas de slot → renvoyer vers la page d'accueil du programme
  if (!record) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Vous n'êtes pas Membre Fondateur"
        body="Réservez d'abord votre place pour accéder au questionnaire."
        ctaHref="/fondateur"
        ctaLabel="Voir le programme"
      />
    );
  }

  // Déjà soumis
  if (status === "completed" || completed) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        title="Merci pour votre retour !"
        body="Votre questionnaire est enregistré. Le Premium à vie et le badge Fondateur sont actifs sur votre compte."
        ctaHref="/categories"
        ctaLabel="Retour au tableau de bord"
        success
      />
    );
  }

  // Expiré
  if (status === "expired") {
    return (
      <EmptyState
        icon={<XCircle className="h-5 w-5 text-rose-600" />}
        title="Délai dépassé"
        body={`Les ${QUESTIONNAIRE_WINDOW_DAYS} jours pour remplir le questionnaire sont écoulés. Vous gardez votre numéro de fondateur, mais le Premium à vie ne sera pas débloqué.`}
        ctaHref="/categories"
        ctaLabel="Retour au tableau de bord"
        danger
      />
    );
  }

  const onSubmit = async (values: FormValues) => {
    const result = await submit({
      usage: values.usage.trim(),
      nps: values.nps,
      frustration: values.frustration.trim(),
      topFeature: values.topFeature.trim(),
      pricing: values.pricing
    });

    if (result.ok) {
      toast.success("Merci ! Premium à vie + badge Fondateur débloqués.");
      setCompleted(true);
      router.refresh();
      return;
    }

    if (result.reason === "expired") {
      toast.error("Délai dépassé — vos réponses n'ont pas pu être enregistrées.");
    } else if (result.reason === "already_done") {
      toast.info("Vous avez déjà soumis vos réponses.");
      setCompleted(true);
    } else if (result.reason === "no_slot") {
      toast.error("Vous n'êtes pas Membre Fondateur.");
    } else {
      toast.error("Impossible d'enregistrer vos réponses. Réessayez plus tard.");
    }
  };

  const isUrgent = (daysRemaining ?? 0) <= 3;
  const npsValue = form.watch("nps");

  return (
    <Card className="relative overflow-hidden border-indigo-200/60 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:border-indigo-800/60 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="mr-1 h-3 w-3" /> Fondateur #{record.slot}
          </Badge>
          <Badge
            variant="outline"
            className={
              isUrgent
                ? "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }
          >
            {daysRemaining === 0
              ? "Dernier jour"
              : `${daysRemaining} jour${(daysRemaining ?? 0) > 1 ? "s" : ""} restant${(daysRemaining ?? 0) > 1 ? "s" : ""}`}
          </Badge>
        </div>

        <CardTitle className="text-2xl font-bold sm:text-3xl">
          Questionnaire Membre Fondateur
        </CardTitle>
        <CardDescription>
          5 questions, environ 5 minutes. À la soumission : <strong className="font-semibold text-indigo-700 dark:text-indigo-300">Premium à vie</strong> et badge Fondateur débloqués automatiquement.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1. Comment utilisez-vous RideCloud aujourd&apos;hui ?</FormLabel>
                  <FormDescription>
                    Type de véhicules, fréquence d&apos;utilisation, contexte. Soyez concret·e.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Ex : Je suis-uis mes 2 motos + 1 voiture, principalement pour ne plus rater les révisions."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    2. Sur une échelle de 0 à 10, recommanderiez-vous RideCloud ?
                  </FormLabel>
                  <FormDescription>
                    0 = jamais · 10 = à tout le monde, sans hésiter.
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>0</span>
                        <span className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                          {npsValue} / 10
                        </span>
                        <span>10</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frustration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3. Qu&apos;est-ce qui vous frustre le plus dans RideCloud ?</FormLabel>
                  <FormDescription>
                    Bug, lenteur, fonctionnalité manquante, parcours peu clair... Tout retour est utile, même négatif.
                    Mettez &quot;aucun&quot; si vraiment rien.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Ex : Je n'arrive pas à exporter en PDF un véhicule entier."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topFeature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4. Quelle fonctionnalité utilisez-vous le plus ?</FormLabel>
                  <FormDescription>
                    Plan d&apos;entretien, IA Mistral, suivi coûts, modifications, export, autre...
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Ex : Le plan d'entretien auto-généré par l'IA — je n'ai rien d'équivalent ailleurs."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>5. Seriez-vous prêt·e à payer pour RideCloud ?</FormLabel>
                  <FormDescription>
                    Le Premium est à 3,99 € / mois (ou 39 € / an). Hors votre Premium à vie de Fondateur !
                  </FormDescription>
                  <FormControl>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {PRICING_OPTIONS.map((opt) => {
                        const selected = field.value === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={`rounded-lg border p-3 text-left text-sm transition ${
                              selected
                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-900 ring-2 ring-indigo-500/30 dark:text-indigo-100"
                                : "border-slate-200 bg-white/60 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-indigo-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="ghost">
                <Link href="/fondateur">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                Envoyer et débloquer le Premium à vie
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state for fallback views
// ---------------------------------------------------------------------------

function EmptyState({
  icon,
  title,
  body,
  ctaHref,
  ctaLabel,
  success,
  danger
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
  success?: boolean;
  danger?: boolean;
}) {
  const tone = success
    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
    : danger
    ? "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/30"
    : "border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40";

  return (
    <Card className={`relative overflow-hidden ${tone}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
