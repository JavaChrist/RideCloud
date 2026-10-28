import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { familyInviteAcceptPath, familyInviteEmailRedirect } from "@/lib/family/invite-flow";

export type FamilyInviteMailer = "resend" | "supabase_smtp" | "none";

export type FamilyInviteSendResult =
  | { ok: true; provider: Exclude<FamilyInviteMailer, "none"> }
  | { ok: false; provider: FamilyInviteMailer; error: string };

const DEFAULT_FROM = "RideCloud <noreply@ridecloud.app>";

export function familyInviteEmailSubject(): string {
  return "Invitation à rejoindre un foyer Family RideCloud";
}

export function familyInviteEmailText(input: { ownerLabel: string; acceptUrl: string }): string {
  return [
    `${input.ownerLabel} vous invite à rejoindre son foyer Family sur RideCloud.`,
    "Créez un compte ou connectez-vous avec cette adresse e-mail, puis confirmez l'invitation.",
    "Vous n'avez pas besoin de payer : l'accès suit l'abonnement Family du titulaire.",
    input.acceptUrl
  ].join("\n\n");
}

export function resolveFamilyInviteMailer(env: {
  resendApiKey?: string | null;
  supabaseUrl?: string | null;
  supabaseAnonKey?: string | null;
} = {
  resendApiKey: process.env.RESEND_API_KEY,
  supabaseUrl,
  supabaseAnonKey
}): { ready: boolean; provider: FamilyInviteMailer } {
  if (env.resendApiKey?.trim()) {
    return { ready: true, provider: "resend" };
  }
  if (env.supabaseUrl?.trim() && env.supabaseAnonKey?.trim()) {
    return { ready: true, provider: "supabase_smtp" };
  }
  return { ready: false, provider: "none" };
}

export async function sendFamilyInviteEmail(input: {
  to: string;
  ownerLabel: string;
  token: string;
  origin: string;
}): Promise<FamilyInviteSendResult> {
  const acceptUrl = `${input.origin.replace(/\/$/, "")}${familyInviteAcceptPath(input.token)}`;
  const mailer = resolveFamilyInviteMailer();
  if (!mailer.ready) {
    return { ok: false, provider: "none", error: "unconfigured" };
  }

  if (mailer.provider === "resend") {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
          to: [input.to],
          subject: familyInviteEmailSubject(),
          text: familyInviteEmailText({ ownerLabel: input.ownerLabel, acceptUrl })
        })
      });
      if (!response.ok) {
        return { ok: false, provider: "resend", error: `resend_http_${response.status}` };
      }
      return { ok: true, provider: "resend" };
    } catch {
      return { ok: false, provider: "resend", error: "resend_unreachable" };
    }
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, provider: "none", error: "unconfigured" };
  }

  try {
    const auth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { error } = await auth.auth.signInWithOtp({
      email: input.to,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: familyInviteEmailRedirect(input.origin, input.token)
      }
    });
    if (error) {
      return { ok: false, provider: "supabase_smtp", error: error.message.slice(0, 180) };
    }
    return { ok: true, provider: "supabase_smtp" };
  } catch (error) {
    return {
      ok: false,
      provider: "supabase_smtp",
      error: error instanceof Error ? error.message.slice(0, 180) : "smtp_failed"
    };
  }
}
