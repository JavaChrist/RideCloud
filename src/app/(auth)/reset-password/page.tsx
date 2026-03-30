import { Logo } from "@/components/common/logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-md rounded-2xl border bg-white shadow-soft">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto"><Logo compact /></div>
        <CardTitle className="text-2xl">Réinitialiser le mot de passe</CardTitle>
        <CardDescription>Choisissez un nouveau mot de passe.</CardDescription>
      </CardHeader>
      <CardContent><ResetPasswordForm /></CardContent>
    </Card>
  );
}
