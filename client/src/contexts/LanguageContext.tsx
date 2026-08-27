import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type LanguageCode = "en" | "hi" | "hinglish" | "bho" | "bn" | "gu" | "kn" | "ml" | "mr" | "pa" | "ta" | "te";
type Dictionary = Record<string, string>;

const translations: Partial<Record<LanguageCode, Dictionary>> = {
  hi: { "Dashboard": "डैशबोर्ड", "Content Studio": "कंटेंट स्टूडियो", "Scheduling": "शेड्यूलिंग", "Automation": "ऑटोमेशन", "Analytics": "एनालिटिक्स", "Account": "खाता", "Billing": "बिलिंग", "Workspace": "वर्कस्पेस", "Settings": "सेटिंग्स", "Connected Accounts": "कनेक्टेड अकाउंट्स", "Content Generator": "कंटेंट जनरेटर", "Generate Content": "कंटेंट बनाएं" },
  bho: { "Dashboard": "डैशबोर्ड", "Content Studio": "कंटेंट स्टूडियो", "Scheduling": "शेड्यूलिंग", "Automation": "ऑटोमेशन", "Analytics": "एनालिटिक्स", "Account": "खाता", "Billing": "बिलिंग", "Workspace": "वर्कस्पेस", "Settings": "सेटिंग्स", "Connected Accounts": "जुड़ल अकाउंट", "Content Generator": "कंटेंट जनरेटर", "Generate Content": "कंटेंट बनाईं" },
};

type LanguageContextValue = { language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (text: string) => string; isSaving: boolean; };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const languageQuery = trpc.accountPreferences.getLanguage.useQuery(undefined, { enabled: isAuthenticated });
  const saveLanguage = trpc.accountPreferences.setLanguage.useMutation();
  useEffect(() => { const saved = languageQuery.data as LanguageCode | undefined; if (saved) setLanguageState(saved); }, [languageQuery.data]);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const value = useMemo<LanguageContextValue>(() => ({ language, setLanguage: (next) => { setLanguageState(next); if (isAuthenticated) saveLanguage.mutate({ language: next }); }, t: (text) => translations[language]?.[text] ?? text, isSaving: saveLanguage.isPending }), [isAuthenticated, language, saveLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
