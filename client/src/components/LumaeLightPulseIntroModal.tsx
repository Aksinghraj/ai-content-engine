import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { LumaeLightPulse } from "@/components/LumaeLightPulse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

export const LUMAE_PULSE_INTRO_STORAGE_KEY = "lumae_pulse_intro_seen";

/**
 * A private, browser-local introduction for Lumae's shared AI activity mark.
 * It mounts through a Dialog portal, so it does not change dashboard geometry.
 */
export function LumaeLightPulseIntroModal() {
  const [open, setOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const dismissalRecordedRef = useRef(false);
  const recordDismissal = trpc.lightPulseIntro.recordDismissal.useMutation();

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(reducedMotionQuery.matches);

    updateMotionPreference();
    reducedMotionQuery.addEventListener("change", updateMotionPreference);

    try {
      if (!window.localStorage.getItem(LUMAE_PULSE_INTRO_STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      // Storage can be unavailable in privacy-restricted browsers. The dialog
      // remains usable and will simply be eligible to appear on a later visit.
      setOpen(true);
    }

    return () => reducedMotionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  const dismiss = () => {
    if (dismissalRecordedRef.current) {
      setOpen(false);
      return;
    }
    dismissalRecordedRef.current = true;

    try {
      window.localStorage.setItem(LUMAE_PULSE_INTRO_STORAGE_KEY, "true");
    } catch {
      // Do not block dismissal if browser storage is unavailable.
    }
    setOpen(false);
    // The metric is aggregate-only and intentionally non-blocking: the user
    // can dismiss the dialog even if the analytics request cannot complete.
    void recordDismissal.mutateAsync().catch(() => undefined);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) dismiss();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-border bg-card p-0 text-card-foreground shadow-2xl">
        <div className="border-b border-border bg-gradient-to-br from-[#6366f1]/12 via-[#8b5cf6]/8 to-[#06b6d4]/10 px-6 pt-8 pb-7 sm:px-8">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-background/55 shadow-[0_14px_34px_rgb(99_102_241_/_18%)]">
            <LumaeLightPulse
              state={prefersReducedMotion ? "idle" : "working"}
              size={58}
              label="Lumae Light Pulse preview"
            />
          </div>
          <DialogHeader className="gap-3 text-left">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              THE LUMAE LIGHT PULSE
            </div>
            <DialogTitle className="text-2xl tracking-tight text-foreground">
              Intelligence, in motion.
            </DialogTitle>
            <DialogDescription className="max-w-sm text-sm leading-6 text-muted-foreground">
              This L-shaped light path is how Lumae quietly signals that it is creating, analysing, or preparing your work.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 sm:px-8">
          <p className="text-sm leading-6 text-muted-foreground">
            It stays still when Lumae is ready, flows only while work is in progress, and automatically becomes static if you prefer reduced motion.
          </p>
          <DialogFooter className="mt-6 sm:justify-start">
            <Button type="button" className="lumae-gradient-cta min-w-28" onClick={dismiss} autoFocus>
              Got it
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
