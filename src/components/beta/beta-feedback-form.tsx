"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Star, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  overall_rating: z.number().int().min(1, "Sélectionnez une note").max(5),
  ease_of_use: z.number().int().min(1, "Sélectionnez une note").max(5),
  most_useful_feature: z.string().min(5, "Décrivez la fonctionnalité (min 5 caractères)").max(500),
  improvements: z.string().min(10, "Décrivez une amélioration (min 10 caractères)").max(1000),
  would_recommend: z.boolean(),
  would_pay: z.enum(["yes_current", "yes_cheaper", "no"]),
  additional_comments: z.string().max(2000).optional()
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

function StarRating({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300 dark:text-slate-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function YesNoButtons({
  value,
  onChange,
  labels
}: {
  value: string | boolean | undefined;
  onChange: (v: boolean) => void;
  labels?: [string, string];
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          value === true
            ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        {labels?.[0] ?? "Oui"}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          value === false
            ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
        {labels?.[1] ?? "Non"}
      </button>
    </div>
  );
}

const WOULD_PAY_OPTIONS = [
  {
    value: "yes_current" as const,
    label: "Oui, aux tarifs actuels",
    icon: <ThumbsUp className="h-4 w-4 text-green-500" />
  },
  {
    value: "yes_cheaper" as const,
    label: "Oui, si moins cher",
    icon: <Minus className="h-4 w-4 text-amber-500" />
  },
  {
    value: "no" as const,
    label: "Non",
    icon: <ThumbsDown className="h-4 w-4 text-red-500" />
  }
];

export function BetaFeedbackForm() {
  const router = useRouter();
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overall_rating: 0,
      ease_of_use: 0,
      most_useful_feature: "",
      improvements: "",
      additional_comments: ""
    }
  });

  const onSubmit = async (values: FeedbackValues) => {
    try {
      const res = await fetch("/api/beta/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'envoi.");
        return;
      }
      toast.success("Merci pour votre retour ! Votre accès reprend normalement.");
      router.push("/categories");
      router.refresh();
    } catch {
      toast.error("Impossible d'envoyer le formulaire.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <FormField
          control={form.control}
          name="overall_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Note globale de l&apos;application</FormLabel>
              <FormControl>
                <StarRating value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ease_of_use"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Facilité de prise en main</FormLabel>
              <FormControl>
                <StarRating value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="most_useful_feature"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Quelle fonctionnalité vous a été la plus utile ?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex : le plan d'entretien automatique, les rappels, l'export PDF..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="improvements"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Qu&apos;est-ce qui pourrait être amélioré ?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Soyez précis, c'est ce qui nous aide le plus..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="would_recommend"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Recommanderiez-vous RideCloud à un proche ?</FormLabel>
              <FormControl>
                <YesNoButtons value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="would_pay"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Seriez-vous prêt(e) à payer pour continuer à utiliser RideCloud ?</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-3">
                  {WOULD_PAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        field.value === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additional_comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Commentaires libres <span className="text-muted-foreground font-normal">(facultatif)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tout ce que vous souhaitez ajouter..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Envoi en cours..." : "Envoyer mon retour et reprendre l'accès"}
        </Button>
      </form>
    </Form>
  );
}
