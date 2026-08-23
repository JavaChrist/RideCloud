import { afterEach, describe, expect, it, vi } from "vitest";
import { isCapacitorNative, shouldRegisterServiceWorkerOnBoot, shouldRunPwaUpdateClient } from "./environment";
import {
  applyWaitingOrReload,
  checkForAppUpdate,
  createReloadGuard,
  resetUpdateCheckCache,
  shouldPromptForPwaUpdate
} from "./update-check";
import { registerRideCloudServiceWorker, resetServiceWorkerRegistrationCache } from "./service-worker";

afterEach(() => {
  resetUpdateCheckCache();
  resetServiceWorkerRegistrationCache();
});

describe("environnement Capacitor", () => {
  it("exclut le wrapper natif", () => {
    expect(isCapacitorNative({ Capacitor: { isNativePlatform: () => true } })).toBe(true);
    expect(isCapacitorNative({ Capacitor: { isNativePlatform: () => false } })).toBe(false);
    expect(isCapacitorNative({})).toBe(false);
  });

  it("n'enregistre pas le SW et ne lance pas la détection sur Capacitor", () => {
    expect(shouldRegisterServiceWorkerOnBoot({ isNative: true, nodeEnv: "production" })).toBe(false);
    expect(shouldRunPwaUpdateClient({ isNative: true, nodeEnv: "production" })).toBe(false);
  });

  it("n'enregistre pas le SW en next dev (HMR)", () => {
    expect(shouldRegisterServiceWorkerOnBoot({ isNative: false, nodeEnv: "development" })).toBe(false);
    expect(shouldRunPwaUpdateClient({ isNative: false, nodeEnv: "development" })).toBe(false);
  });

  it("active le client PWA en production web", () => {
    expect(shouldRegisterServiceWorkerOnBoot({ isNative: false, nodeEnv: "production" })).toBe(true);
    expect(shouldRunPwaUpdateClient({ isNative: false, nodeEnv: "production" })).toBe(true);
  });
});

describe("shouldPromptForPwaUpdate", () => {
  it("aucune modale si version identique", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: false,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_1",
        hasWaitingWorker: false
      })
    ).toBe(false);
  });

  it("modale si version différente", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: false,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_2",
        hasWaitingWorker: false
      })
    ).toBe(true);
  });

  it("modale si un nouveau SW est en waiting", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: false,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_1",
        hasWaitingWorker: true
      })
    ).toBe(true);
  });

  it("aucune modale dans Capacitor même si version différente", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: true,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_2",
        hasWaitingWorker: true
      })
    ).toBe(false);
  });

  it("Plus tard masque la proposition pour cette version", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: false,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_2",
        hasWaitingWorker: false,
        dismissedVersion: "dpl_2"
      })
    ).toBe(false);
  });
});

describe("checkForAppUpdate", () => {
  it("ne propose rien si Capacitor", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      fetchDeployedVersion: async () => "dpl_new",
      refreshRegistration: async () => null
    });
    expect(result.shouldPrompt).toBe(false);
  });

  it("propose une mise à jour quand l'API renvoie une autre version", async () => {
    const result = await checkForAppUpdate({
      isNative: false,
      loadedVersion: "dpl_old",
      fetchDeployedVersion: async () => "dpl_new",
      refreshRegistration: async () => null
    });
    expect(result).toMatchObject({
      shouldPrompt: true,
      deployedVersion: "dpl_new",
      hasWaitingWorker: false
    });
  });
});

describe("createReloadGuard", () => {
  it("empêche un double reload", () => {
    const reload = vi.fn();
    const reloadOnce = createReloadGuard(reload);
    expect(reloadOnce()).toBe(true);
    expect(reloadOnce()).toBe(false);
    expect(reloadOnce()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe("applyWaitingOrReload", () => {
  it("envoie SKIP_WAITING si un worker attend, sans reload immédiat", () => {
    const reloadOnce = vi.fn(() => true);
    const postMessage = vi.fn();
    expect(applyWaitingOrReload({ waiting: { postMessage }, reloadOnce })).toBe("skip-waiting");
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    expect(reloadOnce).not.toHaveBeenCalled();
  });

  it("recharge directement s'il n'y a pas de worker waiting (version déployée différente)", () => {
    const reloadOnce = vi.fn(() => true);
    expect(applyWaitingOrReload({ waiting: null, reloadOnce })).toBe("reload");
    expect(reloadOnce).toHaveBeenCalledTimes(1);
  });
});

describe("registerRideCloudServiceWorker", () => {
  it("n'appelle jamais Notification.requestPermission", async () => {
    const requestPermission = vi.fn();
    (globalThis as { Notification?: { requestPermission: () => Promise<string> } }).Notification = {
      requestPermission
    };

    const register = vi.fn().mockResolvedValue({ scope: "/" });
    const getRegistration = vi.fn().mockResolvedValue(undefined);
    const nav = {
      serviceWorker: { getRegistration, register }
    } as unknown as Pick<Navigator, "serviceWorker">;

    await registerRideCloudServiceWorker(nav);
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    expect(requestPermission).not.toHaveBeenCalled();
  });
});
