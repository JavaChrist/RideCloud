"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", acceptTerms: false as unknown as true }
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/categories` }
      });
      if (error) return toast.error(error.message);
      setRegisteredEmail(values.email);
    } catch {
      toast.error("Impossible de créer le compte.");
    }
  };

  // Écran de confirmation post-inscription
  if (registeredEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Compte créé avec succès !
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Un e-mail de confirmation a été envoyé à
          </p>
          <p className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-50">
            <Mail className="h-4 w-4 text-slate-500" />
            {registeredEmail}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-4 text-left text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">Avant de vous connecter :</p>
          <ol className="ml-4 list-decimal space-y-1 text-blue-800 dark:text-blue-200">
            <li>Ouvrez votre boîte mail.</li>
            <li>Cliquez sur le lien de confirmation dans l&apos;e-mail RideCloud.</li>
            <li>Revenez ici pour vous connecter.</li>
          </ol>
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
            Pensez à vérifier vos spams si vous ne le trouvez pas.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Aller à la page de connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Adresse e-mail</FormLabel><FormControl><Input type="email" autoComplete="username" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-10" {...field} />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmer le mot de passe</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" className="pr-10" {...field} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="acceptTerms" render={({ field }) => (
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
                  <Link
                    href="/cgu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Conditions Générales d&apos;Utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/confidentialite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Politique de confidentialité
                  </Link>
                  .
                </FormLabel>
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Création..." : "Créer un compte"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">Déjà inscrit ? <Link href="/login" className="text-primary hover:underline">Se connecter</Link></p>
      </form>
    </Form>
  );
}
