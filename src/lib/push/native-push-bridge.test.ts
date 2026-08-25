import { describe, expect, it, vi } from "vitest";
import {
  isUnsafeCapacitorThenable,
  loadNativePushBridge,
  wrapPushNotificationsPlugin,
  type CapacitorPushPluginLike
} from "@/lib/push/native-push-bridge";
import { runNativePushRegistration } from "@/lib/push/native-register-flow";
import { withTimeout } from "@/lib/push/native-status";

function createCapacitorLikeProxy(): CapacitorPushPluginLike {
  const calls: string[] = [];
  const target = {
    checkPermissions: async () => {
      calls.push("checkPermissions");
      return { receive: "granted" };
    },
    requestPermissions: async () => ({ receive: "granted" }),
    register: async () => {
      calls.push("register");
    },
    createChannel: async () => undefined,
    removeAllListeners: async () => undefined,
    addListener: async () => undefined,
    calls
  };
  return new Proxy(target, {
    get(source, property) {
      if (property === "then") {
        return () => {
          throw new Error("PushNotifications.then() is not implemented on android");
        };
      }
      return Reflect.get(source, property);
    }
  }) as CapacitorPushPluginLike & { calls: string[] };
}

describe("wrapPushNotificationsPlugin", () => {
  it("A — le loader ne retourne jamais le proxy brut thenable", async () => {
    const proxy = createCapacitorLikeProxy();
    expect(isUnsafeCapacitorThenable(proxy)).toBe(true);
    await expect(Promise.resolve(proxy)).rejects.toThrow(/PushNotifications\.then\(\)/);

    const bridge = await loadNativePushBridge(async () => ({ PushNotifications: proxy }));
    expect(isUnsafeCapacitorThenable(bridge)).toBe(false);
    expect(bridge).not.toBe(proxy);
    await expect(Promise.resolve(bridge)).resolves.toBe(bridge);
  });

  it("B — checkPermissions() est appelée normalement", async () => {
    const proxy = createCapacitorLikeProxy() as CapacitorPushPluginLike & { calls: string[] };
    const bridge = wrapPushNotificationsPlugin(proxy);
    await expect(bridge.checkPermissions()).resolves.toEqual({ receive: "granted" });
    expect(proxy.calls).toContain("checkPermissions");
  });

  it("C — register() n'accède jamais à plugin.then", async () => {
    const proxy = createCapacitorLikeProxy() as CapacitorPushPluginLike & { calls: string[] };
    const bridge = wrapPushNotificationsPlugin(proxy);
    await expect(bridge.register()).resolves.toBeUndefined();
    expect(proxy.calls).toContain("register");
    await expect(Promise.resolve(bridge).then((value) => value.register())).resolves.toBeUndefined();
  });

  it("G — le loader ne provoque pas de timeout", async () => {
    const proxy = createCapacitorLikeProxy();
    await expect(withTimeout(loadNativePushBridge(async () => ({ PushNotifications: proxy })), 50)).resolves.toMatchObject(
      {
        checkPermissions: expect.any(Function),
        register: expect.any(Function)
      }
    );
  });
});

describe("bridge + registration flow", () => {
  it("D — registration reçu → token → API", async () => {
    const persistToken = vi.fn(async () => undefined);
    let onRegistration: ((token: string) => void) | undefined;
    const result = await runNativePushRegistration({
      timeoutMs: 30,
      log: () => undefined,
      resetListeners: async () => undefined,
      installListeners: async (handlers) => {
        onRegistration = handlers.onRegistration;
      },
      register: async () => {
        onRegistration?.("fcm-token-aaaa");
      },
      persistToken
    });
    expect(persistToken).toHaveBeenCalledWith("fcm-token-aaaa");
    expect(result).toMatchObject({ ok: true, linked: true, tokenReceived: true });
  });

  it("E — registrationError propagé", async () => {
    let onError: ((message: string) => void) | undefined;
    const result = await runNativePushRegistration({
      timeoutMs: 30,
      log: () => undefined,
      resetListeners: async () => undefined,
      installListeners: async (handlers) => {
        onError = handlers.onRegistrationError;
      },
      register: async () => {
        onError?.("SERVICE_NOT_AVAILABLE");
      },
      persistToken: async () => undefined
    });
    expect(result).toMatchObject({ ok: false, reason: "registration_error", retryable: true });
  });

  it("F — Retry fonctionne après une erreur", async () => {
    let attempt = 0;
    let onRegistration: ((token: string) => void) | undefined;
    const persistToken = vi.fn(async () => {
      if (attempt === 1) throw new Error("register_failed");
    });
    const deps = {
      timeoutMs: 30,
      log: () => undefined,
      resetListeners: async () => undefined,
      installListeners: async (handlers: { onRegistration: (token: string) => void }) => {
        onRegistration = handlers.onRegistration;
      },
      register: async () => {
        attempt += 1;
        onRegistration?.("fcm-token-bbbb");
      },
      persistToken
    };
    const first = await runNativePushRegistration(deps);
    expect(first.ok).toBe(false);
    const second = await runNativePushRegistration(deps);
    expect(second.ok).toBe(true);
  });
});
