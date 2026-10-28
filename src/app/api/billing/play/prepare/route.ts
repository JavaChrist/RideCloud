import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHECKOUT_CONSENT_VERSION } from "@/lib/billing/plans";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { getPlayCatalogEntry } from "@/lib/billing/play-products";
import { hasPaidPeriodRemaining, playReplacementParams } from "@/lib/billing/play-state";
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
      "plan, plan_status, plan_canceled_at, plan_renews_at, billing_provider, mollie_subscription_id, play_purchase_token, play_product_id"
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    plan: string | null;
    plan_status: string | null;
    plan_canceled_at: string | null;
    plan_renews_at: string | null;
    billing_provider: string | null;
    mollie_subscription_id: string | null;
    play_purchase_token: string | null;
    play_product_id: string | null;
  } | null;

  const paidRemaining = hasPaidPeriodRemaining({
    plan: profile?.plan,
    planStatus: profile?.plan_status,
    canceledAt: profile?.plan_canceled_at,
    renewsAt: profile?.plan_renews_at,
    mollieSubscriptionId: profile?.mollie_subscription_id,
    playPurchaseToken: profile?.play_purchase_token
  });

  const catalog = getPlayCatalogEntry(parsed.plan, parsed.interval);
  const isPlayOwner = Boolean(profile?.play_purchase_token) && profile?.billing_provider !== "mollie";

  if (paidRemaining && !isPlayOwner) {
    return NextResponse.json(
      {
        error:
          "Un abonnement encore valable est déjà en cours. Attendez la fin de la période payée avant de changer de prestataire."
      },
      { status: 409 }
    );
  }

  const replacement = isPlayOwner
    ? playReplacementParams({
        paidRemaining,
        playProductId: profile?.play_product_id,
        playPurchaseToken: profile?.play_purchase_token
      })
    : null;

  return NextResponse.json({
    productId: catalog.productId,
    basePlanId: catalog.basePlanId,
    obfuscatedAccountId: user.id,
    replacement
  });
}
