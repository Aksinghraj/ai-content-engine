import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  highContrast: boolean;
  setTheme: (theme: Theme) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = "lumae-theme";
const CONTRAST_STORAGE_KEY = "lumae-high-contrast";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "auto",
  switchable = true,
}: ThemeProviderProps) {
  const { isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined" || !switchable) return defaultTheme;
    return (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme;
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : true,
  );
  const [hasSyncedAccountTheme, setHasSyncedAccountTheme] = useState(false);
  const [highContrast, setHighContrastState] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(CONTRAST_STORAGE_KEY) === "true",
  );

  const statusQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const setThemeMutation = trpc.subscription.setTheme.useMutation();
  const setHighContrastMutation = trpc.subscription.setHighContrast.useMutation();

  const effectiveTheme = useMemo<"light" | "dark">(
    () => theme === "auto" ? (systemPrefersDark ? "dark" : "light") : theme,
    [systemPrefersDark, theme],
  );

  useEffect(() => {
    const storedTheme = typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
    const accountTheme = statusQuery.data?.theme as Theme | undefined;
    if (!isAuthenticated || !accountTheme || storedTheme || hasSyncedAccountTheme) return;
    setThemeState(accountTheme);
    setHasSyncedAccountTheme(true);
  }, [hasSyncedAccountTheme, isAuthenticated, statusQuery.data?.theme]);

  useEffect(() => {
    const storedContrast = typeof window === "undefined" ? null : localStorage.getItem(CONTRAST_STORAGE_KEY);
    if (!isAuthenticated || storedContrast !== null || typeof statusQuery.data?.highContrast !== "boolean") return;
    setHighContrastState(statusQuery.data.highContrast);
  }, [isAuthenticated, statusQuery.data?.highContrast]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemPrefersDark(mediaQuery.matches);
    updateSystemTheme();
    mediaQuery.addEventListener?.("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener?.("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.classList.toggle("high-contrast", highContrast);
    root.dataset.theme = effectiveTheme;
    root.dataset.contrast = highContrast ? "high" : "standard";
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme, highContrast]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    if (switchable) localStorage.setItem(STORAGE_KEY, nextTheme);
    if (isAuthenticated) setThemeMutation.mutate({ theme: nextTheme });
  };

  const toggleTheme = () => setTheme(effectiveTheme === "dark" ? "light" : "dark");
  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem(CONTRAST_STORAGE_KEY, String(enabled));
    if (isAuthenticated) setHighContrastMutation.mutate({ highContrast: enabled });
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, highContrast, setTheme, setHighContrast, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
