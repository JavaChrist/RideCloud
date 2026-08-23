import { describe, expect, it } from "vitest";
import { APP_VERSION_FALLBACK, getLoadedAppVersion, hasDeployedAppUpdate, resolveAppVersion } from "./app-version";

describe("resolveAppVersion", () => {
  it("privilégie l'id de déploiement Vercel, déterministe et sans secret", () => {
    expect(
      resolveAppVersion({
        VERCEL_DEPLOYMENT_ID: "dpl_abc",
        VERCEL_GIT_COMMIT_SHA: "deadbeef"
      })
    ).toBe("dpl_abc");
  });

  it("se rabat sur le SHA git puis sur dev", () => {
    expect(resolveAppVersion({ VERCEL_GIT_COMMIT_SHA: "cafebabe" })).toBe("cafebabe");
    expect(resolveAppVersion({})).toBe(APP_VERSION_FALLBACK);
  });
});

describe("hasDeployedAppUpdate", () => {
  it("n'affiche rien si les versions sont identiques", () => {
    expect(hasDeployedAppUpdate("dpl_1", "dpl_1")).toBe(false);
  });

  it("détecte une nouvelle version déployée", () => {
    expect(hasDeployedAppUpdate("dpl_1", "dpl_2")).toBe(true);
  });

  it("ignore une version déployée absente", () => {
    expect(hasDeployedAppUpdate("dpl_1", null)).toBe(false);
    expect(hasDeployedAppUpdate("", "dpl_2")).toBe(false);
  });
});

describe("getLoadedAppVersion", () => {
  it("retourne au moins le fallback de développement", () => {
    expect(typeof getLoadedAppVersion()).toBe("string");
    expect(getLoadedAppVersion().length).toBeGreaterThan(0);
  });
});
