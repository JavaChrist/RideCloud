import type { NativePushPlatform } from "@/types/database";

export interface NativeTokenRecord {
  id: string;
  user_id: string;
  platform: NativePushPlatform;
  token: string;
  installation_id: string | null;
}

export function assertNativeTokenOwner(input: {
  sessionUserId: string;
  requestedUserId?: string | null;
}): boolean {
  if (input.requestedUserId && input.requestedUserId !== input.sessionUserId) {
    return false;
  }
  return true;
}

export function isInvalidFcmError(code: string | undefined): boolean {
  return (
    code === "messaging/registration-token-not-registered" ||
    code === "messaging/invalid-registration-token" ||
    code === "messaging/invalid-argument"
  );
}

export function collectPushRecipientIds(webUserIds: string[], nativeUserIds: string[]): Set<string> {
  return new Set([...webUserIds, ...nativeUserIds]);
}

/**
 * Décide l'upsert : même token → update (y compris réassignation de device) ;
 * même installation du user courant → remplace le token ; sinon insert.
 * Le user_id écrit est toujours celui de la session.
 */
export function planNativeTokenUpsert(input: {
  sessionUserId: string;
  platform: NativePushPlatform;
  token: string;
  installationId: string | null;
  existingByToken: NativeTokenRecord | null;
  existingByInstallation: NativeTokenRecord | null;
}): { action: "insert" | "update"; targetId?: string; userId: string } {
  const userId = input.sessionUserId;
  if (input.existingByToken) {
    return { action: "update", targetId: input.existingByToken.id, userId };
  }
  if (input.existingByInstallation && input.existingByInstallation.user_id === userId) {
    return { action: "update", targetId: input.existingByInstallation.id, userId };
  }
  return { action: "insert", userId };
}
