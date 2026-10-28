import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHECKOUT_CONSENT_VERSION } from "@/lib/billing/plans";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { getPlayProductId } from "@/lib/billing/play-products";
import { hasOpenPaidSubscription } from "@/lib/billing/play-state";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  plan: z.enum(["premium", "family"]),
  interval: z.enum(["monthly", "yearly"]),
  consent: z.object({
    consentAccepted: z.literal(true),
    consentVersion: z.string().min(1),
    consentAcceptedAt: z.string().datetime()
  })
});

/**
 * POST /api/billing/play/prepare
 *
 * Prépare un achat Google Play : consentement, profil, produit.
 * L'activation réelle n'a lieu qu'après /api/billing/play/verify.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const rl = rateLimit(`play-prepare:${user.id}`, 8, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const ip = getClientIp(request);
  const rlIp = rateLimit(`play-prepare-ip:${ip}`, 8, 60 * 60 * 1000);
  if (!rlIp.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives depuis cette adresse. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rlIp.resetInMs / 1000)) } }
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Paramètres invalides. Cochez le consentement puis réessayez." },
      { status: 400 }
    );
  }

  if (parsed.consent.consentVersion !== CHECKOUT_CONSENT_VERSION) {
    return NextResponse.json(
      { error: "Le texte de consentement a été mis à jour. Rechargez la page." },
      { status: 409 }
    );
  }

  const admin = createAdminClient();
  const ensured = await ensureProfile(admin, user.id, user.email);
  if (!ensured.ok) {
    return NextResponse.json(
      { error: `Préparation du profil impossible : ${ensured.error}` },
      { status: 500 }
    );
  }

  const { data: profileData } = await admin
    .from("profiles")
    .select(
      "plan, plan_status, plan_canceled_at, plan_renews_at, mollie_subscription_id, play_purchase_token"
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    plan: string | null;
    plan_status: string | null;
    plan_canceled_at: string | null;
    plan_renews_at: string | null;
    mollie_subscription_id: string | null;
    play_purchase_token: string | null;
  } | null;

  if (
    hasOpenPaidSubscription({
      plan: profile?.plan,
      planStatus: profile?.plan_status,
      canceledAt: profile?.plan_canceled_at,
      renewsAt: profile?.plan_renews_at,
      mollieSubscriptionId: profile?.mollie_subscription_id,
      playPurchaseToken: profile?.play_purchase_token
    })
  ) {
    return NextResponse.json(
      {
        error:
          "Vous avez déjà un abonnement actif. Annulez-le d'abord depuis la page Paramètres."
      },
      { status: 409 }
    );
  }

  if (profile?.plan === "free" || profile?.plan_status === "pending") {
    await admin
      .from("profiles")
      .update({
        plan_status: "pending",
        plan_interval: parsed.interval,
        updated_at: new Date().toISOString()
      } as never)
      .eq("id", user.id);
  }

  console.info("[billing/play/prepare] consent recorded", {
    userId: user.id,
    plan: parsed.plan,
    interval: parsed.interval,
    consentVersion: parsed.consent.consentVersion,
    consentAcceptedAt: parsed.consent.consentAcceptedAt,
    consentIp: ip ?? "unknown"
  });

  return NextResponse.json({
    productId: getPlayProductId(parsed.plan, parsed.interval),
    obfuscatedAccountId: user.id
  });
}
