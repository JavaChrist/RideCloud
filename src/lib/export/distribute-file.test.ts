import { describe, expect, it, vi } from "vitest";
import {
  blobToBase64,
  handleVehicleExportClick,
  isShareCancellation,
  nativeWriteModeFor,
  parseContentDispositionFilename,
  sanitizeExportFileName,
  shareFetchedExport
} from "./distribute-file";

describe("parseContentDispositionFilename", () => {
  it("lit un filename entre guillemets", () => {
    expect(parseContentDispositionFilename('attachment; filename="ridecloud-vehicule-abc.json"')).toBe(
      "ridecloud-vehicule-abc.json"
    );
  });

  it("lit le filename ZIP renvoyé par l'API", () => {
    expect(parseContentDispositionFilename('attachment; filename="ridecloud-dossier-abc.zip"')).toBe(
      "ridecloud-dossier-abc.zip"
    );
  });

  it("lit filename* UTF-8", () => {
    expect(parseContentDispositionFilename("attachment; filename*=UTF-8''ridecloud-vehicule-abc.json")).toBe(
      "ridecloud-vehicule-abc.json"
    );
  });

  it("retourne null sans en-tête", () => {
    expect(parseContentDispositionFilename(null)).toBeNull();
  });
});

describe("sanitizeExportFileName", () => {
  it("garde le nom de fichier simple", () => {
    expect(sanitizeExportFileName("ridecloud-vehicule-1.json", "fallback.json")).toBe("ridecloud-vehicule-1.json");
  });

  it("retire toute traversée de chemin", () => {
    expect(sanitizeExportFileName("../etc/passwd", "fallback.json")).toBe("passwd");
  });
});

describe("nativeWriteModeFor", () => {
  it("écrit le JSON en UTF-8", () => {
    expect(nativeWriteModeFor("ridecloud-vehicule-1.json", "application/json; charset=utf-8")).toBe("utf8");
  });

  it("écrit le ZIP en base64", () => {
    expect(nativeWriteModeFor("ridecloud-dossier-1.zip", "application/zip")).toBe("base64");
  });
});

describe("isShareCancellation", () => {
  it("reconnaît une annulation iOS/Android", () => {
    expect(isShareCancellation(new Error("Share canceled"))).toBe(true);
    expect(isShareCancellation({ message: "User cancelled" })).toBe(true);
    expect(isShareCancellation({ code: "SHARE_CANCELED" })).toBe(true);
  });

  it("ne masque pas une erreur d'écriture", () => {
    expect(isShareCancellation(new Error("Unable to write file"))).toBe(false);
  });
});

describe("blobToBase64", () => {
  it("encode un binaire sans le traiter comme du texte", async () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0xff]);
    const encoded = await blobToBase64(new Blob([bytes]));
    expect(encoded).toBe(btoa(String.fromCharCode(...bytes)));
  });
});

describe("shareFetchedExport", () => {
  it("écrit le JSON en texte UTF-8 puis ouvre Share", async () => {
    const writeTextFile = vi.fn().mockResolvedValue("file://cache/export.json");
    const writeBase64File = vi.fn();
    const shareFile = vi.fn().mockResolvedValue(undefined);
    const json = '{"app":"RideCloud","city":"Portet-sur-Garonne"}';

    const result = await shareFetchedExport({
      href: "/api/vehicule/abc/export",
      fallbackFileName: "fallback.json",
      fetchImpl: async () =>
        new Response(json, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": 'attachment; filename="ridecloud-vehicule-abc.json"'
          }
        }),
      native: { writeTextFile, writeBase64File, shareFile }
    });

    expect(result).toBe("shared");
    expect(writeTextFile).toHaveBeenCalledWith("ridecloud-exports/ridecloud-vehicule-abc.json", json);
    expect(writeBase64File).not.toHaveBeenCalled();
    expect(shareFile).toHaveBeenCalledWith("file://cache/export.json", "ridecloud-vehicule-abc.json");
  });

  it("écrit le ZIP en base64 puis ouvre Share", async () => {
    const writeTextFile = vi.fn();
    const writeBase64File = vi.fn().mockResolvedValue("file://cache/export.zip");
    const shareFile = vi.fn().mockResolvedValue(undefined);
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

    const result = await shareFetchedExport({
      href: "/api/vehicule/abc/export-zip",
      fallbackFileName: "ridecloud-dossier-abc.zip",
      fetchImpl: async () =>
        new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="ridecloud-dossier-abc.zip"'
          }
        }),
      native: { writeTextFile, writeBase64File, shareFile }
    });

    expect(result).toBe("shared");
    expect(writeTextFile).not.toHaveBeenCalled();
    expect(writeBase64File).toHaveBeenCalledTimes(1);
    expect(writeBase64File.mock.calls[0]?.[0]).toBe("ridecloud-exports/ridecloud-dossier-abc.zip");
    expect(writeBase64File.mock.calls[0]?.[1]).toBe(await blobToBase64(new Blob([bytes])));
  });

  it("ne remonte pas l'annulation de la feuille Share comme une erreur", async () => {
    const result = await shareFetchedExport({
      href: "/api/vehicule/abc/export",
      fallbackFileName: "fallback.json",
      fetchImpl: async () => new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
      native: {
        writeTextFile: vi.fn().mockResolvedValue("file://cache/export.json"),
        writeBase64File: vi.fn(),
        shareFile: vi.fn().mockRejectedValue(new Error("Share canceled"))
      }
    });

    expect(result).toBe("cancelled");
  });

  it("échoue proprement si l'écriture native échoue", async () => {
    await expect(
      shareFetchedExport({
        href: "/api/vehicule/abc/export",
        fallbackFileName: "fallback.json",
        fetchImpl: async () => new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
        native: {
          writeTextFile: vi.fn().mockRejectedValue(new Error("Unable to write file")),
          writeBase64File: vi.fn(),
          shareFile: vi.fn()
        }
      })
    ).rejects.toThrow("Unable to write file");
  });

  it("échoue si l'API refuse l'export", async () => {
    await expect(
      shareFetchedExport({
        href: "/api/vehicule/abc/export",
        fallbackFileName: "fallback.json",
        fetchImpl: async () => new Response("nope", { status: 401 }),
        native: {
          writeTextFile: vi.fn(),
          writeBase64File: vi.fn(),
          shareFile: vi.fn()
        }
      })
    ).rejects.toThrow("EXPORT_FAILED");
  });
});

describe("handleVehicleExportClick", () => {
  it("laisse le navigateur télécharger hors Capacitor", async () => {
    const preventDefault = vi.fn();
    const result = await handleVehicleExportClick({
      event: { preventDefault },
      href: "/api/vehicule/abc/export",
      fallbackFileName: "x.json",
      isNative: false
    });
    expect(result).toBe("web");
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
