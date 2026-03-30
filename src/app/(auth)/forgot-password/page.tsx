import { Logo } from "@/components/common/logo";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md rounded-2xl border bg-white shadow-soft">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto"><Logo compact /></div>
        <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
        <CardDescription>Recevez un lien de réinitialisation.</CardDescription>
      </CardHeader>
      <CardContent><ForgotPasswordForm /></CardContent>
    </Card>
  );
}
