import { describe, expect, it } from "vitest";
import {
  nativeStatusLabel,
  resolveNativeActionView,
  resolveNotificationsDetectionView,
  withTimeout
} from "@/lib/push/native-status";

const grantedLinked = {
  available: true,
  permission: "granted" as const,
  linked: true
};

describe("resolveNotificationsDetectionView", () => {
  it("A — permission granted + token serveur / linked → état activé, spinner stoppé", () => {
    const view = resolveNotificationsDetectionView({
      phase: "loading",
      isAndroidNative: true,
      nativeStatus: grantedLinked,
      webStatus: null,
      error: null
    });
    expect(view).toMatchObject({ kind: "native", label: "activated", linked: true });
    expect(view.kind).not.toBe("loading");
  });

  it("B — permission granted + registration reçue → état activé", () => {
    const view = resolveNativeActionView({
      permission: "granted",
      linked: true
    });
    expect(view).toMatchObject({ kind: "native", label: "activated" });
  });

  it("C — permission denied → état refusé, spinner stoppé", () => {
    const view = resolveNotificationsDetectionView({
      phase: "ready",
      isAndroidNative: true,
      nativeStatus: { available: true, permission: "denied", linked: false },
      webStatus: null,
      error: null
    });
    expect(view).toMatchObject({ kind: "native", label: "denied" });
    expect(view.kind).not.toBe("loading");
  });

  it("D — registrationError → état erreur, spinner stoppé", () => {
    const view = resolveNativeActionView({
      permission: "granted",
      linked: false,
      actionError: "registration_error"
    });
    expect(view).toMatchObject({ kind: "error", recoverable: true });
    expect(view.kind).not.toBe("loading");
  });

  it("E — API register échoue → état erreur récupérable, spinner stoppé", () => {
    const view = resolveNativeActionView({
      permission: "granted",
      linked: false,
      actionError: "register_api"
    });
    expect(view).toMatchObject({ kind: "error", recoverable: true });
    expect(view.kind).not.toBe("loading");
  });

  it("G — token déjà présent → ne pas rester en détection", () => {
    expect(nativeStatusLabel(grantedLinked)).toBe("activated");
    const view = resolveNotificationsDetectionView({
      phase: "loading",
      isAndroidNative: true,
      nativeStatus: grantedLinked,
      webStatus: null,
      error: null
    });
    expect(view.kind).toBe("native");
    expect(view.kind).not.toBe("loading");
  });
});

describe("withTimeout", () => {
  it("F — aucun événement / promise pendante → timeout, spinner stoppé", async () => {
    const pending = new Promise<string>(() => undefined);
    await expect(withTimeout(pending, 20, "token_timeout")).rejects.toThrow("token_timeout");
    const view = resolveNativeActionView({
      permission: "granted",
      linked: false,
      actionError: "timeout"
    });
    expect(view).toMatchObject({ kind: "error", recoverable: true });
    expect(view.kind).not.toBe("loading");
  });

  it("résout avant le timeout", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50)).resolves.toBe("ok");
  });
});
