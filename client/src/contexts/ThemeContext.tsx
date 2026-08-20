import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = "lumae-theme";

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

  const statusQuery = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const setThemeMutation = trpc.subscription.setTheme.useMutation();

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
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemPrefersDark(mediaQuery.matches);
    updateSystemTheme();
    mediaQuery.addEventListener?.("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener?.("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.dataset.theme = effectiveTheme;
    root.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    if (switchable) localStorage.setItem(STORAGE_KEY, nextTheme);
    if (isAuthenticated) setThemeMutation.mutate({ theme: nextTheme });
  };

  const toggleTheme = () => setTheme(effectiveTheme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
