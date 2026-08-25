import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertNativeTokenOwner,
  planNativeTokenUpsert,
  type NativeTokenRecord
} from "@/lib/push/native-tokens";
import type { Database, NativePushPlatform } from "@/types/database";

type NativeTokensClient = Pick<SupabaseClient<Database>, "from">;

export interface RegisterNativePushInput {
  admin: NativeTokensClient;
  sessionUserId: string;
  requestedUserId?: string | null;
  token: string;
  platform: NativePushPlatform;
  installationId: string | null;
}

export async function registerNativePushToken(
  input: RegisterNativePushInput
): Promise<{ ok: true } | { ok: false; status: number; reason: string }> {
  if (
    !assertNativeTokenOwner({
      sessionUserId: input.sessionUserId,
      requestedUserId: input.requestedUserId
    })
  ) {
    return { ok: false, status: 403, reason: "forbidden" };
  }

  const nowIso = new Date().toISOString();
  const tokenQuery = await input.admin
    .from("native_push_tokens")
    .select("id, user_id, platform, token, installation_id")
    .eq("token", input.token)
    .maybeSingle();

  if (tokenQuery.error) {
    return { ok: false, status: 500, reason: "db_error" };
  }

  let existingByInstallation: NativeTokenRecord | null = null;
  if (input.installationId) {
    const installQuery = await input.admin
      .from("native_push_tokens")
      .select("id, user_id, platform, token, installation_id")
      .eq("user_id", input.sessionUserId)
      .eq("installation_id", input.installationId)
      .maybeSingle();
    if (installQuery.error) {
      return { ok: false, status: 500, reason: "db_error" };
    }
    existingByInstallation = (installQuery.data as NativeTokenRecord | null) ?? null;
  }

  const plan = planNativeTokenUpsert({
    sessionUserId: input.sessionUserId,
    platform: input.platform,
    token: input.token,
    installationId: input.installationId,
    existingByToken: (tokenQuery.data as NativeTokenRecord | null) ?? null,
    existingByInstallation
  });

  const fields = {
    user_id: plan.userId,
    platform: input.platform,
    token: input.token,
    installation_id: input.installationId,
    updated_at: nowIso,
    last_seen_at: nowIso
  };

  if (plan.action === "update" && plan.targetId) {
    const { error } = await input.admin
      .from("native_push_tokens")
      .update(fields as never)
      .eq("id", plan.targetId);
    if (error) return { ok: false, status: 500, reason: "db_error" };
    return { ok: true };
  }

  const { error } = await input.admin.from("native_push_tokens").insert(fields as never);
  if (error) return { ok: false, status: 500, reason: "db_error" };
  return { ok: true };
}

export async function unregisterNativePushToken(input: {
  admin: NativeTokensClient;
  sessionUserId: string;
  installationId: string;
}): Promise<{ ok: true } | { ok: false; status: number; reason: string }> {
  const { error } = await input.admin
    .from("native_push_tokens")
    .delete()
    .eq("user_id", input.sessionUserId)
    .eq("installation_id", input.installationId);

  if (error) return { ok: false, status: 500, reason: "db_error" };
  return { ok: true };
}
