"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values: LoginValues) => {
    setNeedsConfirmation(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        const message = error.message?.toLowerCase() ?? "";
        const code = (error as { code?: string }).code ?? "";
        if (code === "email_not_confirmed" || message.includes("not confirmed") || message.includes("confirm")) {
          setNeedsConfirmation(true);
          toast.error("Votre e-mail n'est pas encore confirmé. Renvoyez-le ci-dessous.");
          return;
        }
        toast.error(error.message);
        return;
      }
      toast.success("Connexion réussie");
      router.push("/categories");
      router.refresh();
    } catch {
      toast.error("Impossible de se connecter. Vérifiez Supabase.");
    }
  };

  const handleResend = async () => {
    const email = form.getValues("email").trim();
    if (!email || !EMAIL_REGEX.test(email)) {
      form.setError("email", { type: "manual", message: "Saisissez d'abord votre adresse e-mail" });
      form.setFocus("email");
      return;
    }
    setIsResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("E-mail de confirmation renvoyé. Vérifiez votre boîte (et les spams).");
    } catch {
      toast.error("Impossible de renvoyer l'e-mail pour le moment.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Adresse e-mail</FormLabel><FormControl><Input type="email" autoComplete="username" placeholder="nom@exemple.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...field}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">Mot de passe oublié</Link>
          <Link href="/register" className="text-primary hover:underline">Créer un compte</Link>
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Connexion..." : "Se connecter"}</Button>

        <div className="pt-1">
          <div
            className={`rounded-2xl border bg-slate-50/60 px-3 py-2.5 transition-all duration-300 ${
              needsConfirmation
                ? "border-amber-200 bg-amber-50/70 shadow-[0_0_0_4px_rgba(251,191,36,0.08)]"
                : "border-slate-200/70"
            }`}
          >
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="group flex w-full items-center justify-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Renvoyer l'e-mail de confirmation"
            >
              <MailCheck
                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                  needsConfirmation ? "text-amber-600" : "text-slate-500"
                }`}
                aria-hidden
              />
              <span>
                {isResending
                  ? "Envoi en cours..."
                  : needsConfirmation
                  ? "Renvoyer l'e-mail de confirmation"
                  : "E-mail non reçu ? Renvoyer la confirmation"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
