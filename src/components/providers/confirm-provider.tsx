"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "info" | "warning" | "danger" | "success" | "ai";

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  hideCancel?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const VARIANT_STYLES: Record<
  ConfirmVariant,
  {
    icon: typeof AlertTriangle;
    iconWrap: string;
    accent: string;
    confirmClass: string;
    titleClass: string;
  }
> = {
  info: {
    icon: Info,
    iconWrap: "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    accent: "from-blue-50 dark:from-blue-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900",
    confirmClass:
      "bg-blue-700 text-white hover:bg-blue-800 shadow-[0_4px_14px_-4px_rgba(29,78,216,0.5)]",
    titleClass: "text-slate-900 dark:text-slate-50"
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    accent: "from-amber-50 dark:from-amber-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900",
    confirmClass:
      "bg-amber-600 text-white hover:bg-amber-700 shadow-[0_4px_14px_-4px_rgba(217,119,6,0.55)]",
    titleClass: "text-slate-900 dark:text-slate-50"
  },
  danger: {
    icon: ShieldAlert,
    iconWrap: "border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    accent: "from-rose-50 dark:from-rose-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900",
    confirmClass:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-[0_4px_14px_-4px_rgba(225,29,72,0.55)]",
    titleClass: "text-slate-900 dark:text-slate-50"
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    accent: "from-emerald-50 dark:from-emerald-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900",
    confirmClass:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_14px_-4px_rgba(5,150,105,0.55)]",
    titleClass: "text-slate-900 dark:text-slate-50"
  },
  ai: {
    icon: Sparkles,
    iconWrap: "border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
    accent: "from-violet-50 dark:from-violet-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900",
    confirmClass:
      "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-[0_4px_14px_-4px_rgba(124,58,237,0.55)]",
    titleClass: "text-slate-900 dark:text-slate-50"
  }
};

interface InternalState extends ConfirmOptions {
  open: boolean;
}

const DEFAULT_STATE: InternalState = {
  open: false,
  title: "",
  description: "",
  variant: "info"
};

/**
 * Provider à monter haut dans l'arbre (root layout ou layout protected).
 * Expose un hook `useConfirm()` qui renvoie une fonction `confirm(opts)`
 * retournant une Promise<boolean>. Remplace les `window.confirm()` natifs
 * par une modale stylée, accessible et cohérente avec le design system.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState>(DEFAULT_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const variant = state.variant ?? "info";
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleClose(false);
        }}
      >
        <DialogContent className="overflow-hidden p-0">
          <div
            className={cn(
              "relative bg-gradient-to-b px-6 pb-6 pt-6",
              styles.accent
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent"
            />
            <DialogHeader className="!p-0">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                    styles.iconWrap
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} aria-hidden />
                </span>
                <DialogTitle className={cn("text-lg", styles.titleClass)}>
                  {state.title || "Confirmation"}
                </DialogTitle>
              </div>
              {state.description ? (
                <DialogDescription className="whitespace-pre-line">
                  {state.description}
                </DialogDescription>
              ) : null}
            </DialogHeader>
          </div>
          <DialogFooter>
            {!state.hideCancel && (
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950"
              >
                {state.cancelText ?? "Annuler"}
              </Button>
            )}
            <Button
              autoFocus
              onClick={() => handleClose(true)}
              className={cn(styles.confirmClass)}
            >
              {state.confirmText ?? "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirm doit être appelé à l'intérieur d'un <ConfirmProvider />."
    );
  }
  return ctx.confirm;
}

// Re-export utilitaire au cas où d'autres composants veulent l'icône d'aide
export { HelpCircle };
