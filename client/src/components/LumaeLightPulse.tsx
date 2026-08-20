import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export type LumaeLightPulseState = "idle" | "working" | "thinking" | "complete" | "error";

type LumaeLightPulseProps = {
  state?: LumaeLightPulseState;
  size?: number;
  className?: string;
  label?: string;
};

/**
 * Lumae's signature motion mark. It intentionally uses one small L-shaped
 * path for all AI work instead of page-specific loading decorations.
 */
export function LumaeLightPulse({
  state = "idle",
  size = 16,
  className,
  label = "Lumae is working",
}: LumaeLightPulseProps) {
  // This mark is intentionally constrained to the size of a compact status
  // icon, so it never becomes an attention-grabbing loading treatment.
  const visualSize = Math.min(Math.max(size, 14), 18);
  const isActive = state === "working" || state === "thinking" || state === "complete";

  return (
    <span
      className={cn("lumae-light-pulse", `lumae-light-pulse--${state}`, className)}
      style={{ "--lumae-light-pulse-size": `${visualSize}px` } as CSSProperties}
      role={isActive ? "status" : undefined}
      aria-label={isActive ? label : undefined}
      aria-live={isActive ? "polite" : undefined}
    >
      <svg
        aria-hidden="true"
        width={visualSize}
        height={visualSize}
        viewBox="0 0 48 48"
        fill="none"
        focusable="false"
      >
        <path className="lumae-light-pulse__path" d="M12 8V36H39" pathLength="100" />
        <path
          className="lumae-light-pulse__trail"
          d="M12 8V36H39"
          pathLength="100"
        />
      </svg>
      <span className="sr-only">{isActive ? label : "Lumae ready"}</span>
    </span>
  );
}
