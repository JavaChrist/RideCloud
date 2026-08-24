import { isCapacitorNative } from "@/lib/pwa/environment";

export type NativeWriteMode = "utf8" | "base64";

export interface NativeFileBridge {
  writeTextFile: (path: string, data: string) => Promise<string>;
  writeBase64File: (path: string, data: string) => Promise<string>;
  shareFile: (uri: string, fileName: string) => Promise<void>;
}

export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;

  const utf = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  if (utf?.[1]) {
    const raw = utf[1].trim().replace(/^["']|["']$/g, "");
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];

  const plain = /filename=([^;]+)/i.exec(header);
  return plain?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;
}

export function sanitizeExportFileName(name: string, fallback: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop()?.trim() || fallback;
  const cleaned = base.replace(/[<>:"|?*\x00-\x1F]/g, "_");
  return cleaned.length > 0 ? cleaned : fallback;
}

export function shouldWriteAsUtf8Text(fileName: string, mimeType: string): boolean {
  return fileName.toLowerCase().endsWith(".json") || mimeType.toLowerCase().includes("json");
}

export function isShareCancellation(error: unknown): boolean {
  if (!error) return false;
  const record = error as { message?: unknown; code?: unknown };
  const message = [record.message, record.code, error instanceof Error ? error.message : error]
    .filter((value) => typeof value === "string" || typeof value === "number")
    .join(" ");
  return /cancel|cancelled|canceled|dismiss|abort/i.test(message);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function nativeWriteModeFor(fileName: string, mimeType: string): NativeWriteMode {
  return shouldWriteAsUtf8Text(fileName, mimeType) ? "utf8" : "base64";
}

async function defaultNativeBridge(): Promise<NativeFileBridge> {
  const { Directory, Encoding, Filesystem } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");

  const write = async (path: string, data: string, encoding?: typeof Encoding.UTF8) => {
    const written = await Filesystem.writeFile({
      path,
      data,
      directory: Directory.Cache,
      recursive: true,
      ...(encoding ? { encoding } : {})
    });
    if (written.uri) return written.uri;
    const located = await Filesystem.getUri({ path, directory: Directory.Cache });
    return located.uri;
  };

  return {
    writeTextFile: (path, data) => write(path, data, Encoding.UTF8),
    writeBase64File: (path, data) => write(path, data),
    shareFile: async (uri, fileName) => {
      await Share.share({
        title: fileName,
        files: [uri],
        dialogTitle: "Exporter le fichier"
      });
    }
  };
}

export async function shareFetchedExport(input: {
  href: string;
  fallbackFileName: string;
  fetchImpl?: typeof fetch;
  native?: NativeFileBridge;
}): Promise<"shared" | "cancelled"> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(input.href, {
    method: "GET",
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error("EXPORT_FAILED");
  }

  const blob = await response.blob();
  const headerName = parseContentDispositionFilename(response.headers.get("content-disposition"));
  const fileName = sanitizeExportFileName(headerName ?? input.fallbackFileName, input.fallbackFileName);
  const mimeType = response.headers.get("content-type") ?? blob.type ?? "";
  const path = `ridecloud-exports/${fileName}`;
  const native = input.native ?? (await defaultNativeBridge());

  const uri =
    nativeWriteModeFor(fileName, mimeType) === "utf8"
      ? await native.writeTextFile(path, await blob.text())
      : await native.writeBase64File(path, await blobToBase64(blob));

  try {
    await native.shareFile(uri, fileName);
    return "shared";
  } catch (error) {
    if (isShareCancellation(error)) return "cancelled";
    throw error;
  }
}

export async function handleVehicleExportClick(input: {
  event: { preventDefault: () => void };
  href: string;
  fallbackFileName: string;
  isNative?: boolean;
}): Promise<"web" | "shared" | "cancelled"> {
  const isNative = input.isNative ?? isCapacitorNative();
  if (!isNative) return "web";

  input.event.preventDefault();
  return shareFetchedExport({
    href: input.href,
    fallbackFileName: input.fallbackFileName
  });
}
