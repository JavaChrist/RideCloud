export type NativeRegisterLog =
  | "register:start"
  | "registration:event"
  | "registration:error"
  | "register:timeout"
  | "register:api";

export type NativeRegisterFailure = "registration_error" | "register_api" | "timeout" | "register_failed";

export interface NativeRegisterResult {
  ok: boolean;
  retryable: boolean;
  tokenReceived: boolean;
  tokenLength: number;
  linked: boolean;
  reason?: NativeRegisterFailure;
}

export interface NativeRegisterDeps {
  timeoutMs: number;
  installListeners: (handlers: {
    onRegistration: (token: string) => void;
    onRegistrationError: (message: string) => void;
  }) => Promise<void>;
  register: () => Promise<void>;
  persistToken: (token: string) => Promise<void>;
  resetListeners: () => Promise<void>;
  log: (event: NativeRegisterLog, extra?: { tokenReceived?: boolean; tokenLength?: number }) => void;
}

export function didInstallListenersBeforeRegister(steps: string[]): boolean {
  const registration = steps.indexOf("addListener:registration");
  const registrationError = steps.indexOf("addListener:registrationError");
  const register = steps.indexOf("register");
  return registration >= 0 && registrationError >= 0 && register > registration && register > registrationError;
}

export function isNativePushActivated(input: { linked: boolean; tokenReceived: boolean }): boolean {
  return input.linked && input.tokenReceived;
}

export async function runNativePushRegistration(deps: NativeRegisterDeps): Promise<NativeRegisterResult> {
  deps.log("register:start");
  await deps.resetListeners();

  let settled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const tokenPromise = new Promise<string>((resolve, reject) => {
    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      deps.log("register:timeout");
      reject(new Error("token_timeout"));
    }, deps.timeoutMs);

    void deps
      .installListeners({
        onRegistration: (token) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          deps.log("registration:event", { tokenReceived: true, tokenLength: token.length });
          resolve(token);
        },
        onRegistrationError: () => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          deps.log("registration:error");
          reject(new Error("registration_error"));
        }
      })
      .then(() => deps.register())
      .catch((error) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        reject(error instanceof Error ? error : new Error("register_failed"));
      });
  });

  try {
    const token = await tokenPromise;
    try {
      deps.log("register:api");
      await deps.persistToken(token);
      return {
        ok: true,
        retryable: false,
        tokenReceived: true,
        tokenLength: token.length,
        linked: true
      };
    } catch {
      await deps.resetListeners();
      return {
        ok: false,
        retryable: true,
        tokenReceived: true,
        tokenLength: token.length,
        linked: false,
        reason: "register_api"
      };
    }
  } catch (error) {
    await deps.resetListeners();
    const message = error instanceof Error ? error.message : "register_failed";
    const reason: NativeRegisterFailure =
      message === "token_timeout"
        ? "timeout"
        : /registration/i.test(message)
          ? "registration_error"
          : "register_failed";
    return {
      ok: false,
      retryable: true,
      tokenReceived: false,
      tokenLength: 0,
      linked: false,
      reason
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
