import { describe, expect, it } from "vitest";
import {
  ACKNOWLEDGED_APP_VERSION_KEY,
  readAcknowledgedAppVersion,
  resolveNativePromptVersion,
  seedAcknowledgedAppVersion,
  writeAcknowledgedAppVersion,
  type VersionStorage
} from "./acknowledged-version";

function createMemoryStorage(initial?: Record<string, string>): VersionStorage {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    }
  };
}

describe("seedAcknowledgedAppVersion", () => {
  it("A — premier lancement : initialise N et ne propose rien", () => {
    const storage = createMemoryStorage();
    expect(readAcknowledgedAppVersion(storage)).toBeNull();
    expect(seedAcknowledgedAppVersion(storage, "dpl_N")).toBe("dpl_N");
    expect(readAcknowledgedAppVersion(storage)).toBe("dpl_N");
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_N",
        loadedVersion: "dpl_N",
        deployedVersion: "dpl_N"
      })
    ).toBeNull();
  });

  it("ne réécrit pas une version déjà persistée", () => {
    const storage = createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" });
    expect(seedAcknowledgedAppVersion(storage, "dpl_Nplus1")).toBe("dpl_N");
  });
});

describe("resolveNativePromptVersion", () => {
  it("B — égalité complète : aucune modale", () => {
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_N",
        loadedVersion: "dpl_N",
        deployedVersion: "dpl_N"
      })
    ).toBeNull();
  });

  it("C — app ouverte pendant le déploiement : remote N+1", () => {
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_N",
        loadedVersion: "dpl_N",
        deployedVersion: "dpl_Nplus1"
      })
    ).toBe("dpl_Nplus1");
  });

  it("D — app fermée pendant le déploiement : persisted N / current N+1", () => {
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_N",
        loadedVersion: "dpl_Nplus1",
        deployedVersion: "dpl_Nplus1"
      })
    ).toBe("dpl_Nplus1");
  });

  it("F / I — après acceptation : aucune nouvelle modale", () => {
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_Nplus1",
        loadedVersion: "dpl_Nplus1",
        deployedVersion: "dpl_Nplus1"
      })
    ).toBeNull();
  });

  it("H — erreur réseau : persisted ≠ current suffit", () => {
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_N",
        loadedVersion: "dpl_Nplus1",
        deployedVersion: null
      })
    ).toBe("dpl_Nplus1");
  });
});

describe("writeAcknowledgedAppVersion", () => {
  it("E — Mettre à jour persiste N+1", () => {
    const storage = createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" });
    expect(writeAcknowledgedAppVersion(storage, "dpl_Nplus1")).toBe(true);
    expect(readAcknowledgedAppVersion(storage)).toBe("dpl_Nplus1");
  });

  it("G — Plus tard ne persiste pas N+1", () => {
    const storage = createMemoryStorage({ [ACKNOWLEDGED_APP_VERSION_KEY]: "dpl_N" });
    expect(readAcknowledgedAppVersion(storage)).toBe("dpl_N");
    expect(
      resolveNativePromptVersion({
        acknowledgedVersion: "dpl_N",
        loadedVersion: "dpl_Nplus1",
        deployedVersion: "dpl_Nplus1"
      })
    ).toBe("dpl_Nplus1");
  });

  it("n'écrit pas une chaîne vide et survit à un storage absent", () => {
    expect(writeAcknowledgedAppVersion(null, "dpl_N")).toBe(false);
    expect(writeAcknowledgedAppVersion(createMemoryStorage(), "")).toBe(false);
    expect(readAcknowledgedAppVersion(null)).toBeNull();
  });
});
