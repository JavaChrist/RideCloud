import { Logo } from "@/components/common/logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Card className="relative w-full overflow-hidden rounded-2xl border-slate-200/80 bg-ride-gradient-card shadow-ride-xl backdrop-blur-sm">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
      />
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto">
          <Logo compact />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Réinitialiser le mot de passe
        </CardTitle>
        <CardDescription>Choisissez un nouveau mot de passe.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
