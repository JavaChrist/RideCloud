import { NextResponse } from "next/server";
import { z } from "zod";
import { SequenceType } from "@mollie/api-client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHECKOUT_CONSENT_VERSION, PLANS } from "@/lib/billing/plans";
import {
  describeSubscription,
  getMollieClient,
  hasMollieEnv,
  toMollieAmount
} from "@/lib/billing/mollie";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ConsentSchema = z.object({
  consentAccepted: z.literal(true),
  consentVersion: z.string().min(1),
  consentAcceptedAt: z.string().datetime()
});

const BodySchema = z.object({
  plan: z.enum(["premium", "family"]),
  interval: z.enum(["monthly", "yearly"]),
  consent: ConsentSchema
});

/**
 * POST /api/billing/checkout
 *
 * Démarre le flow Mollie de souscription :
 *   1. Récupère / crée un customer Mollie pour l'utilisateur.
 *   2. Crée un "first payment" pour obtenir un mandat SEPA / carte.
 *   3. Renvoie l'URL de checkout Mollie au client.
 *
 * Le webhook (`/api/billing/webhook`) finalisera la subscription une fois le
 * premier paiement validé.
 */
export async function POST(request: Request) {
  if (!hasMollieEnv()) {
    return NextResponse.json(
      { error: "Paiements indisponibles : MOLLIE_API_KEY non configurée." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // ----- Rate limiting : 5 tentatives / utilisateur / 10 min -----
  const rl = rateLimit(`checkout:${user.id}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) }
      }
    );
  }

  // Rate limit IP pour prévenir les comptes multiples (5 checkouts / IP / heure)
  const ip = getClientIp(request);
  const rlIp = rateLimit(`checkout-ip:${ip}`, 5, 60 * 60 * 1000);
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
      {
        error:
          "Paramètres invalides. Vérifiez notamment que le consentement (CGV et renonciation au droit de rétractation) a été coché."
      },
      { status: 400 }
    );
  }

  const { plan, interval, consent } = parsed;
  const planDef = PLANS[plan];
  const price = interval === "monthly" ? planDef.price.monthly : planDef.price.yearly;
  if (price <= 0) {
    return NextResponse.json({ error: "Plan gratuit, aucun paiement requis" }, { status: 400 });
  }

  if (consent.consentVersion !== CHECKOUT_CONSENT_VERSION) {
    return NextResponse.json(
      {
        error:
          "Le texte de consentement a été mis à jour. Rechargez la page et acceptez à nouveau."
      },
      { status: 409 }
    );
  }

  const consentIp = getClientIp(request);
  const consentUserAgent = request.headers.get("user-agent");

  console.info("[billing/checkout] consent recorded", {
    userId: user.id,
    plan,
    interval,
    consentVersion: consent.consentVersion,
    consentAcceptedAt: consent.consentAcceptedAt,
    consentIp: consentIp ?? "unknown"
  });

  const origin = new URL(request.url).origin;
  const mollie = getMollieClient();
  const admin = createAdminClient();

  // Étape critique : garantir l'existence du profil AVANT toute opération
  // de paiement. Sans ça, les .update() suivants n'affectent aucune ligne
  // et le client repart sans mollie_customer_id en DB.
  const ensured = await ensureProfile(admin, user.id, user.email);
  if (!ensured.ok) {
    return NextResponse.json(
      { error: `Préparation du profil impossible : ${ensured.error}` },
      { status: 500 }
    );
  }

  const { data: profileData } = await admin
    .from("profiles")
    .select("mollie_customer_id, plan, plan_status, mollie_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    mollie_customer_id: string | null;
    plan: string | null;
    plan_status: string | null;
    mollie_subscription_id: string | null;
  } | null;

  let customerId = profile?.mollie_customer_id ?? null;

  if (!customerId) {
    const customer = await mollie.customers.create({
      name: user.email ?? undefined,
      email: user.email ?? undefined,
      metadata: { userId: user.id }
    });
    customerId = customer.id;
    const { error: linkError } = await admin
      .from("profiles")
      .update({ mollie_customer_id: customerId } as never)
      .eq("id", user.id);

    if (linkError) {
      console.error("[billing/checkout] customer id link failed", linkError);
      return NextResponse.json(
        { error: `Enregistrement du customer Mollie impossible : ${linkError.message}` },
        { status: 500 }
      );
    }
  }

  if (profile?.mollie_subscription_id && profile.plan_status === "active") {
    return NextResponse.json(
      {
        error:
          "Vous avez déjà un abonnement actif. Annulez-le d'abord depuis la page Paramètres."
      },
      { status: 409 }
    );
  }

  const payment = await mollie.customerPayments.create({
    customerId,
    amount: toMollieAmount(price),
    description: `${describeSubscription(plan, interval)} — Premier paiement`,
    redirectUrl: `${origin}/parametres?billing=success`,
    cancelUrl: `${origin}/tarifs?billing=cancel`,
    webhookUrl: `${origin}/api/billing/webhook`,
    sequenceType: SequenceType.first,
    metadata: {
      userId: user.id,
      plan,
      interval,
      kind: "first_payment",
      // Preuve d'audit du consentement (art. L.221-28, 13° du Code de la
      // consommation). Conservé côté Mollie + tracé côté Supabase (profiles).
      consentVersion: consent.consentVersion,
      consentAcceptedAt: consent.consentAcceptedAt,
      consentIp: consentIp ?? "unknown",
      consentUserAgent: consentUserAgent?.slice(0, 200) ?? "unknown"
    }
  });

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Mollie n'a pas renvoyé d'URL de checkout. Réessayez." },
      { status: 502 }
    );
  }

  const { error: pendingError } = await admin
    .from("profiles")
    .update({ plan_status: "pending", plan_interval: interval } as never)
    .eq("id", user.id);

  if (pendingError) {
    console.error("[billing/checkout] pending status update failed", pendingError);
    // Non bloquant : la session de paiement Mollie est déjà créée, on laisse
    // l'utilisateur poursuivre. Le webhook (ou /api/billing/sync) recollera.
  }

  return NextResponse.json({ checkoutUrl });
}
