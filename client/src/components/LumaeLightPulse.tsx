import { cn } from "@/lib/utils";

export type LumaeLightPulseState = "idle" | "active" | "complete" | "error";

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
  size = 24,
  className,
  label = "Lumae is working",
}: LumaeLightPulseProps) {
  const isActive = state === "active" || state === "complete";

  return (
    <span
      className={cn("lumae-light-pulse", `lumae-light-pulse--${state}`, className)}
      role={isActive ? "status" : undefined}
      aria-label={isActive ? label : undefined}
      aria-live={isActive ? "polite" : undefined}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="lumae-light-gradient" x1="9" y1="8" x2="39" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="lumae-light-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="lumae-light-pulse__path" d="M12 8V36H39" pathLength="100" />
        <path
          className="lumae-light-pulse__trail"
          d="M12 8V36H39"
          pathLength="100"
          filter="url(#lumae-light-glow)"
        />
      </svg>
      <span className="sr-only">{isActive ? label : "Lumae ready"}</span>
    </span>
  );
}
