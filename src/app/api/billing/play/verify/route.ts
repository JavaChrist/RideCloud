import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHECKOUT_CONSENT_VERSION } from "@/lib/billing/plans";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { applyVerifiedPlayPurchase } from "@/lib/billing/apply-play-purchase";
import { hasPlayBillingEnv } from "@/lib/billing/play-publisher";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BodySchema = z.object({
  purchaseToken: z.string().min(8),
  productId: z.string().min(1).optional(),
  basePlanId: z.string().min(1).optional(),
  orderId: z.string().min(1).optional(),
  consent: z
    .object({
      consentAccepted: z.literal(true),
      consentVersion: z.string().min(1),
      consentAcceptedAt: z.string().datetime()
    })
    .optional()
});

/**
 * POST /api/billing/play/verify
 *
 * Vérifie un jeton d'achat auprès de Google, active le plan, et crée le foyer
 * Family si le titulaire vient de souscrire Family.
 */
export async function POST(request: Request) {
  if (!hasPlayBillingEnv()) {
    return NextResponse.json(
      { error: "Google Play Billing n'est pas encore configuré côté serveur." },
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

  const rl = rateLimit(`play-verify:${user.id}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Jeton d'achat invalide." }, { status: 400 });
  }

  if (parsed.consent && parsed.consent.consentVersion !== CHECKOUT_CONSENT_VERSION) {
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

  try {
    const result = await applyVerifiedPlayPurchase({
      userId: user.id,
      purchaseToken: parsed.purchaseToken,
      claimedProductId: parsed.productId,
      claimedBasePlanId: parsed.basePlanId,
      claimedOrderId: parsed.orderId,
      requireObfuscatedAccount: true
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vérification Google Play impossible.";
    console.error("[billing/play/verify]", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
