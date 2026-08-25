import { describe, expect, it, vi } from "vitest";
import {
  didInstallListenersBeforeRegister,
  isNativePushActivated,
  runNativePushRegistration,
  type NativeRegisterDeps
} from "@/lib/push/native-register-flow";

function createPluginHarness(options?: {
  emit?: "registration" | "registrationError" | "none";
  persist?: "ok" | "fail";
}) {
  const steps: string[] = [];
  const logs: string[] = [];
  let onRegistration: ((token: string) => void) | undefined;
  let onRegistrationError: ((message: string) => void) | undefined;
  const persistToken = vi.fn(async () => {
    steps.push("persist");
    if (options?.persist === "fail") throw new Error("register_failed");
  });

  const deps: NativeRegisterDeps = {
    timeoutMs: 30,
    log: (event) => {
      logs.push(event);
    },
    resetListeners: async () => {
      steps.push("resetListeners");
    },
    installListeners: async (handlers) => {
      steps.push("addListener:registration");
      steps.push("addListener:registrationError");
      onRegistration = handlers.onRegistration;
      onRegistrationError = handlers.onRegistrationError;
    },
    register: async () => {
      steps.push("register");
      if (options?.emit === "registration") onRegistration?.("fcm-token-aaaa");
      if (options?.emit === "registrationError") onRegistrationError?.("SERVICE_NOT_AVAILABLE");
    },
    persistToken
  };

  return { deps, steps, logs, persistToken };
}

describe("runNativePushRegistration", () => {
  it("installe les listeners registration avant register()", async () => {
    const harness = createPluginHarness({ emit: "registration" });
    await runNativePushRegistration(harness.deps);
    expect(didInstallListenersBeforeRegister(harness.steps)).toBe(true);
    expect(harness.steps.indexOf("addListener:registration")).toBeLessThan(harness.steps.indexOf("register"));
  });

  it("propage registrationError", async () => {
    const harness = createPluginHarness({ emit: "registrationError" });
    const result = await runNativePushRegistration(harness.deps);
    expect(result).toMatchObject({
      ok: false,
      retryable: true,
      tokenReceived: false,
      linked: false,
      reason: "registration_error"
    });
    expect(harness.logs).toContain("registration:error");
    expect(harness.persistToken).not.toHaveBeenCalled();
  });

  it("timeout nettoie les listeners", async () => {
    const harness = createPluginHarness({ emit: "none" });
    const result = await runNativePushRegistration(harness.deps);
    expect(result).toMatchObject({ ok: false, reason: "timeout", retryable: true, linked: false });
    expect(harness.logs).toContain("register:timeout");
    expect(harness.steps.filter((step) => step === "resetListeners").length).toBeGreaterThanOrEqual(2);
  });

  it("Retry relance réellement register()", async () => {
    const harness = createPluginHarness({ emit: "none" });
    await runNativePushRegistration(harness.deps);
    await runNativePushRegistration(harness.deps);
    expect(harness.steps.filter((step) => step === "register")).toHaveLength(2);
  });

  it("token reçu → API persist appelée", async () => {
    const harness = createPluginHarness({ emit: "registration" });
    const result = await runNativePushRegistration(harness.deps);
    expect(harness.persistToken).toHaveBeenCalledTimes(1);
    expect(harness.persistToken).toHaveBeenCalledWith("fcm-token-aaaa");
    expect(result).toMatchObject({ ok: true, tokenReceived: true, linked: true, tokenLength: "fcm-token-aaaa".length });
    expect(harness.logs).toContain("register:api");
  });

  it("API succès → linked=true", async () => {
    const harness = createPluginHarness({ emit: "registration", persist: "ok" });
    const result = await runNativePushRegistration(harness.deps);
    expect(result.linked).toBe(true);
    expect(isNativePushActivated(result)).toBe(true);
  });

  it("API erreur → état retryable, linked=false", async () => {
    const harness = createPluginHarness({ emit: "registration", persist: "fail" });
    const result = await runNativePushRegistration(harness.deps);
    expect(result).toMatchObject({ ok: false, reason: "register_api", retryable: true, linked: false });
    expect(isNativePushActivated(result)).toBe(false);
  });

  it("deuxième Retry après erreur fonctionne", async () => {
    const steps: string[] = [];
    let attempt = 0;
    let onRegistration: ((token: string) => void) | undefined;
    const persistToken = vi.fn(async () => {
      if (attempt === 1) throw new Error("register_failed");
    });
    const deps: NativeRegisterDeps = {
      timeoutMs: 30,
      log: () => undefined,
      resetListeners: async () => {
        steps.push("reset");
      },
      installListeners: async (handlers) => {
        onRegistration = handlers.onRegistration;
      },
      register: async () => {
        attempt += 1;
        steps.push(`register:${attempt}`);
        onRegistration?.("fcm-token-bbbb");
      },
      persistToken
    };

    const first = await runNativePushRegistration(deps);
    expect(first.ok).toBe(false);
    const second = await runNativePushRegistration(deps);
    expect(second.ok).toBe(true);
    expect(second.linked).toBe(true);
    expect(steps).toEqual(["reset", "register:1", "reset", "reset", "register:2"]);
  });

  it("absence de token → jamais de faux état détecté", async () => {
    const harness = createPluginHarness({ emit: "none" });
    const result = await runNativePushRegistration(harness.deps);
    expect(result.tokenReceived).toBe(false);
    expect(result.linked).toBe(false);
    expect(isNativePushActivated(result)).toBe(false);
  });
});
