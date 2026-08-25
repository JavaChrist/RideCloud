import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACKNOWLEDGED_APP_VERSION_KEY,
  writeAcknowledgedAppVersion,
  type VersionStorage
} from "./acknowledged-version";
import {
  isCapacitorAndroid,
  isCapacitorNative,
  shouldRegisterServiceWorkerOnBoot,
  shouldRunPwaUpdateClient,
  shouldUseRemoteVersionFallback
} from "./environment";
import { appVersionRequestUrl } from "./app-version";
import {
  applyWaitingOrReload,
  checkForAppUpdate,
  createReloadGuard,
  fetchDeployedAppVersion,
  resetUpdateCheckCache,
  shouldPromptForPwaUpdate
} from "./update-check";
import { registerRideCloudServiceWorker, resetServiceWorkerRegistrationCache } from "./service-worker";

function createMemoryStorage(initial?: Record<string, string>): VersionStorage {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    }
  };
}

afterEach(() => {
  resetUpdateCheckCache();
  resetServiceWorkerRegistrationCache();
});

describe("environnement Capacitor", () => {
  it("exclut le wrapper natif", () => {
    expect(isCapacitorNative({ Capacitor: { isNativePlatform: () => true } })).toBe(true);
    expect(isCapacitorNative({ Capacitor: { isNativePlatform: () => false } })).toBe(false);
    expect(isCapacitorNative({})).toBe(false);
    expect(
      isCapacitorAndroid({
        Capacitor: { isNativePlatform: () => true, getPlatform: () => "android" }
      })
    ).toBe(true);
    expect(
      isCapacitorAndroid({
        Capacitor: { isNativePlatform: () => true, getPlatform: () => "ios" }
      })
    ).toBe(false);
  });

  it("n'enregistre pas le SW sur Capacitor mais lance le fallback version", () => {
    expect(shouldRegisterServiceWorkerOnBoot({ isNative: true, nodeEnv: "production" })).toBe(false);
    expect(shouldRunPwaUpdateClient({ isNative: true, nodeEnv: "production" })).toBe(true);
    expect(shouldUseRemoteVersionFallback(true)).toBe(true);
    expect(shouldUseRemoteVersionFallback(false)).toBe(false);
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

  it("Capacitor : ignore le SW et compare persisted / current / remote", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: true,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_2",
        hasWaitingWorker: true,
        acknowledgedVersion: "dpl_1"
      })
    ).toBe(true);
    expect(
      shouldPromptForPwaUpdate({
        isNative: true,
        loadedVersion: "dpl_1",
        deployedVersion: "dpl_1",
        hasWaitingWorker: true,
        acknowledgedVersion: "dpl_1"
      })
    ).toBe(false);
    expect(
      shouldPromptForPwaUpdate({
        isNative: true,
        loadedVersion: "dpl_2",
        deployedVersion: "dpl_2",
        hasWaitingWorker: true,
        acknowledgedVersion: "dpl_1"
      })
    ).toBe(true);
  });

  it("Capacitor : Plus tard masque N+1 sans l'accepter", () => {
    expect(
      shouldPromptForPwaUpdate({
        isNative: true,
        loadedVersion: "dpl_2",
        deployedVersion: "dpl_2",
        hasWaitingWorker: false,
        acknowledgedVersion: "dpl_1",
        dismissedVersion: "dpl_2"
      })
    ).toBe(false);
    expect(
      shouldPromptForPwaUpdate({
        isNative: true,
        loadedVersion: "dpl_2",
        deployedVersion: "dpl_2",
        hasWaitingWorker: false,
        acknowledgedVersion: "dpl_1"
      })
    ).toBe(true);
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
  it("Capacitor : propose une mise à jour si la version distante change, sans interroger le SW", async () => {
    const refreshRegistration = vi.fn().mockResolvedValue({ waiting: {} });
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_old",
      fetchDeployedVersion: async () => "dpl_new",
      refreshRegistration
    });
    expect(result).toMatchObject({
      shouldPrompt: true,
      deployedVersion: "dpl_new",
      hasWaitingWorker: false
    });
    expect(refreshRegistration).not.toHaveBeenCalled();
  });

  it("A — premier lancement : seed N, aucune modale", async () => {
    const storage = createMemoryStorage();
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_N",
      versionStorage: storage,
      fetchDeployedVersion: async () => "dpl_N"
    });
    expect(result).toMatchObject({
      shouldPrompt: false,
      acknowledgedVersion: "dpl_N",
      promptVersion: null
    });
    expect(storage.getItem(ACKNOWLEDGED_APP_VERSION_KEY)).toBe("dpl_N");
  });

  it("B — aucune mise à jour si persisted = current = remote", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_N",
      versionStorage: createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" }),
      fetchDeployedVersion: async () => "dpl_N"
    });
    expect(result.shouldPrompt).toBe(false);
  });

  it("C — app ouverte : remote N+1 déclenche la modale", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_N",
      versionStorage: createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" }),
      fetchDeployedVersion: async () => "dpl_Nplus1"
    });
    expect(result).toMatchObject({
      shouldPrompt: true,
      promptVersion: "dpl_Nplus1"
    });
  });

  it("D — app fermée : persisted N / current N+1 / remote N+1", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_Nplus1",
      versionStorage: createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" }),
      fetchDeployedVersion: async () => "dpl_Nplus1"
    });
    expect(result).toMatchObject({
      shouldPrompt: true,
      promptVersion: "dpl_Nplus1"
    });
  });

  it("E — Mettre à jour persiste N+1 ; F — plus de modale ensuite", async () => {
    const storage = createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" });
    writeAcknowledgedAppVersion(storage, "dpl_Nplus1");
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_Nplus1",
      versionStorage: storage,
      fetchDeployedVersion: async () => "dpl_Nplus1"
    });
    expect(result.shouldPrompt).toBe(false);
    expect(storage.getItem(ACKNOWLEDGED_APP_VERSION_KEY)).toBe("dpl_Nplus1");
  });

  it("G — Plus tard laisse persisted à N et peut reproposer", async () => {
    const storage = createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" });
    const dismissed = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_Nplus1",
      dismissedVersion: "dpl_Nplus1",
      versionStorage: storage,
      fetchDeployedVersion: async () => "dpl_Nplus1"
    });
    expect(dismissed.shouldPrompt).toBe(false);
    expect(storage.getItem(ACKNOWLEDGED_APP_VERSION_KEY)).toBe("dpl_N");

    resetUpdateCheckCache();
    const later = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_Nplus1",
      versionStorage: storage,
      fetchDeployedVersion: async () => "dpl_Nplus1"
    });
    expect(later.shouldPrompt).toBe(true);
  });

  it("H — erreur réseau : persisted ≠ current affiche quand même la modale", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_Nplus1",
      versionStorage: createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" }),
      fetchDeployedVersion: async () => {
        throw new Error("offline");
      }
    });
    expect(result).toMatchObject({
      shouldPrompt: true,
      deployedVersion: null,
      promptVersion: "dpl_Nplus1"
    });
  });

  it("I — la version déjà acceptée ne redéclenche pas la modale", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_Nplus1",
      versionStorage: createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_Nplus1" }),
      fetchDeployedVersion: async () => "dpl_Nplus1"
    });
    expect(result.shouldPrompt).toBe(false);
  });

  it("Capacitor : aucune modale si persisted = current = remote", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_1",
      fetchDeployedVersion: async () => "dpl_1",
      refreshRegistration: async () => ({ waiting: {} }) as never
    });
    expect(result.shouldPrompt).toBe(false);
  });

  it("une erreur réseau n'affiche pas de modale si persisted = current, et n'explose pas", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_1",
      fetchDeployedVersion: async () => {
        throw new Error("offline");
      },
      refreshRegistration: async () => {
        throw new Error("sw offline");
      }
    });
    expect(result).toMatchObject({
      shouldPrompt: false,
      deployedVersion: null,
      hasWaitingWorker: false
    });
  });

  it("après une erreur, la vérification suivante peut proposer une mise à jour", async () => {
    await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_1",
      fetchDeployedVersion: async () => {
        throw new Error("offline");
      }
    });
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_1",
      fetchDeployedVersion: async () => "dpl_2"
    });
    expect(result.shouldPrompt).toBe(true);
    expect(result.deployedVersion).toBe("dpl_2");
  });

  it("ne repropose pas la même version après Plus tard", async () => {
    const result = await checkForAppUpdate({
      isNative: true,
      loadedVersion: "dpl_1",
      dismissedVersion: "dpl_2",
      fetchDeployedVersion: async () => "dpl_2"
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

  it("Web/iOS : conserve la détection Service Worker waiting", async () => {
    const refreshRegistration = vi.fn().mockResolvedValue({ waiting: { postMessage: vi.fn() } });
    const result = await checkForAppUpdate({
      isNative: false,
      loadedVersion: "dpl_1",
      fetchDeployedVersion: async () => "dpl_1",
      refreshRegistration
    });
    expect(result.shouldPrompt).toBe(true);
    expect(result.hasWaitingWorker).toBe(true);
    expect(refreshRegistration).toHaveBeenCalledTimes(1);
  });
});

describe("fetchDeployedAppVersion", () => {
  it("interroge l'API sans cache", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: "dpl_live" })
    });
    await expect(fetchDeployedAppVersion(fetcher, 99)).resolves.toBe("dpl_live");
    expect(fetcher).toHaveBeenCalledWith(appVersionRequestUrl(99), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache"
      }
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
