"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Ticket } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const betaRegisterSchema = z
  .object({
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(8, "Minimum 8 caractères"),
    confirmPassword: z.string(),
    inviteCode: z
      .string()
      .min(1, "Le code d'invitation est requis")
      .transform((v) => v.trim().toUpperCase()),
    acceptTerms: z.literal(true, {
      message: "Vous devez accepter les conditions."
    })
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"]
  });

type BetaRegisterValues = z.infer<typeof betaRegisterSchema>;

export function BetaRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<BetaRegisterValues>({
    resolver: zodResolver(betaRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      inviteCode: "",
      acceptTerms: false as unknown as true
    }
  });

  const onSubmit = async (values: BetaRegisterValues) => {
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/categories&invite=${encodeURIComponent(values.inviteCode)}`;
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: redirectTo }
      });
      if (error) return toast.error(error.message);
      toast.success("Compte créé ! Vérifiez votre e-mail pour activer votre accès bêta.");
      router.push("/login");
    } catch {
      toast.error("Impossible de créer le compte.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="inviteCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code d&apos;invitation</FormLabel>
              <FormControl>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Ex : BETA-ABCDE"
                    className="pl-9 font-mono uppercase tracking-widest"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse e-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={showConfirmPassword ? "Masquer" : "Afficher"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="pt-2">
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <div className="grid gap-1 leading-tight">
                  <FormLabel className="text-sm font-normal leading-snug text-slate-700 dark:text-slate-200">
                    J&apos;accepte les{" "}
                    <Link href="/cgu" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      CGU
                    </Link>{" "}
                    et la{" "}
                    <Link href="/confidentialite" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      Politique de confidentialité
                    </Link>
                    .
                  </FormLabel>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Création..." : "Rejoindre la bêta"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </Form>
  );
}
