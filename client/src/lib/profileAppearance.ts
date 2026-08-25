export const PROFILE_THEMES = [
  { id: "signal", label: "Signalfield", description: "Lumae teal and midnight", dotClass: "bg-teal-400" },
  { id: "violet", label: "Violet studio", description: "Focused and expressive", dotClass: "bg-violet-400" },
  { id: "sunset", label: "Sunset maker", description: "Warm and optimistic", dotClass: "bg-orange-400" },
  { id: "mono", label: "Monochrome", description: "Quiet editorial contrast", dotClass: "bg-slate-400" },
] as const;

export const COVER_PRESETS = [
  { id: "aurora", label: "Aurora signal", className: "bg-[radial-gradient(circle_at_12%_22%,rgb(20_184_166_/_42%),transparent_30%),radial-gradient(circle_at_82%_16%,rgb(99_102_241_/_36%),transparent_28%),linear-gradient(115deg,#0f1720,#111827)]" },
  { id: "violet-grid", label: "Violet grid", className: "bg-[radial-gradient(circle_at_78%_24%,rgb(167_139_250_/_44%),transparent_28%),linear-gradient(135deg,#17112a,#0f172a)]" },
  { id: "sunrise", label: "Creator sunrise", className: "bg-[radial-gradient(circle_at_22%_24%,rgb(251_146_60_/_48%),transparent_26%),radial-gradient(circle_at_82%_74%,rgb(244_114_182_/_32%),transparent_30%),linear-gradient(115deg,#29151b,#141827)]" },
  { id: "ocean", label: "Ocean depth", className: "bg-[radial-gradient(circle_at_76%_18%,rgb(56_189_248_/_38%),transparent_28%),radial-gradient(circle_at_20%_72%,rgb(45_212_191_/_24%),transparent_28%),linear-gradient(115deg,#082f49,#101827)]" },
  { id: "paper", label: "Editorial paper", className: "bg-[linear-gradient(135deg,#e8e4dc,#cbd5e1)]" },
  { id: "midnight", label: "Midnight frame", className: "bg-[radial-gradient(circle_at_50%_20%,rgb(100_116_139_/_28%),transparent_34%),linear-gradient(115deg,#020617,#111827)]" },
] as const;

export type ProfileThemeId = (typeof PROFILE_THEMES)[number]["id"];
export type CoverPresetId = (typeof COVER_PRESETS)[number]["id"];

export function getCoverPreset(id?: string | null) {
  return COVER_PRESETS.find((preset) => preset.id === id) ?? COVER_PRESETS[0];
}
