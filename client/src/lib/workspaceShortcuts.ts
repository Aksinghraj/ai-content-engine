import { appNavigation } from "@/lib/appNavigation";

export const workspaceShortcuts = appNavigation.map((area, index) => ({
  key: String(index + 1),
  label: area.label,
  path: area.path,
  shortcutLabel: `Alt + Shift + ${index + 1}`,
}));

export function getWorkspaceShortcut(key: string) {
  return workspaceShortcuts.find((shortcut) => shortcut.key === key);
}

export function shouldIgnoreWorkspaceShortcut(target: EventTarget | null) {
  if (!target || typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
  );
}
