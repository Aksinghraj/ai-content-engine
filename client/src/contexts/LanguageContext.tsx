import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", nativeName: "English" }, { code: "hi", name: "Hindi", nativeName: "हिन्दी" }, { code: "hinglish", name: "Hinglish", nativeName: "Hinglish" }, { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" }, { code: "bn", name: "Bengali", nativeName: "বাংলা" }, { code: "brx", name: "Bodo", nativeName: "बड़ो" }, { code: "doi", name: "Dogri", nativeName: "डोगरी" }, { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" }, { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" }, { code: "ks", name: "Kashmiri", nativeName: "کٲشُر" }, { code: "kok", name: "Konkani", nativeName: "कोंकणी" }, { code: "mai", name: "Maithili", nativeName: "मैथिली" }, { code: "ml", name: "Malayalam", nativeName: "മലയാളം" }, { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্" }, { code: "mr", name: "Marathi", nativeName: "मराठी" }, { code: "ne", name: "Nepali", nativeName: "नेपाली" }, { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" }, { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }, { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" }, { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" }, { code: "sd", name: "Sindhi", nativeName: "سنڌي" }, { code: "ta", name: "Tamil", nativeName: "தமிழ்" }, { code: "te", name: "Telugu", nativeName: "తెలుగు" }, { code: "ur", name: "Urdu", nativeName: "اردو" },
] as const;
export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["code"];
type Dictionary = Record<string, string>;

const translations: Partial<Record<LanguageCode, Dictionary>> = {
  hi: { "Dashboard": "डैशबोर्ड", "Content Studio": "कंटेंट स्टूडियो", "Scheduling": "शेड्यूलिंग", "Automation": "ऑटोमेशन", "Analytics": "एनालिटिक्स", "Account": "खाता", "Billing": "बिलिंग", "Workspace": "वर्कस्पेस", "Settings": "सेटिंग्स", "Connected Accounts": "कनेक्टेड अकाउंट्स", "Content Generator": "कंटेंट जनरेटर", "Generate Content": "कंटेंट बनाएं" },
  bho: { "Dashboard": "डैशबोर्ड", "Content Studio": "कंटेंट स्टूडियो", "Scheduling": "शेड्यूलिंग", "Automation": "ऑटोमेशन", "Analytics": "एनालिटिक्स", "Account": "खाता", "Billing": "बिलिंग", "Workspace": "वर्कस्पेस", "Settings": "सेटिंग्स", "Connected Accounts": "जुड़ल अकाउंट", "Content Generator": "कंटेंट जनरेटर", "Generate Content": "कंटेंट बनाईं" },
  bn: { "Dashboard": "ড্যাশবোর্ড", "Content Studio": "কনটেন্ট স্টুডিও", "Scheduling": "সময়সূচি", "Automation": "স্বয়ংক্রিয়তা", "Business": "ব্যবসা", "Analytics": "বিশ্লেষণ", "Account": "অ্যাকাউন্ট", "Billing": "বিলিং", "Workspace": "কর্মক্ষেত্র", "Settings": "সেটিংস", "Connected Accounts": "সংযুক্ত অ্যাকাউন্ট", "Content Generator": "কনটেন্ট জেনারেটর", "Generate Content": "কনটেন্ট তৈরি করুন" },
  gu: { "Dashboard": "ડેશબોર્ડ", "Content Studio": "કન્ટેન્ટ સ્ટુડિયો", "Scheduling": "શેડ્યૂલિંગ", "Automation": "ઓટોમેશન", "Business": "વ્યવસાય", "Analytics": "વિશ્લેષણ", "Account": "ખાતું", "Billing": "બિલિંગ", "Workspace": "કાર્યસ્થળ", "Settings": "સેટિંગ્સ", "Connected Accounts": "જોડાયેલા એકાઉન્ટ્સ", "Content Generator": "કન્ટેન્ટ જનરેટર", "Generate Content": "કન્ટેન્ટ બનાવો" },
  mr: { "Dashboard": "डॅशबोर्ड", "Content Studio": "कंटेंट स्टुडिओ", "Scheduling": "नियोजन", "Automation": "स्वयंचलन", "Business": "व्यवसाय", "Analytics": "विश्लेषण", "Account": "खाते", "Billing": "बिलिंग", "Workspace": "कार्यस्थळ", "Settings": "सेटिंग्ज", "Connected Accounts": "जोडलेली खाती", "Content Generator": "कंटेंट जनरेटर", "Generate Content": "कंटेंट तयार करा" },
  pa: { "Dashboard": "ਡੈਸ਼ਬੋਰਡ", "Content Studio": "ਸਮੱਗਰੀ ਸਟੂਡੀਓ", "Scheduling": "ਸਮਾਂ-ਸੂਚੀ", "Automation": "ਆਟੋਮੇਸ਼ਨ", "Business": "ਕਾਰੋਬਾਰ", "Analytics": "ਵਿਸ਼ਲੇਸ਼ਣ", "Account": "ਖਾਤਾ", "Billing": "ਬਿਲਿੰਗ", "Workspace": "ਵਰਕਸਪੇਸ", "Settings": "ਸੈਟਿੰਗਾਂ", "Connected Accounts": "ਜੁੜੇ ਖਾਤੇ", "Content Generator": "ਸਮੱਗਰੀ ਜਨਰੇਟਰ", "Generate Content": "ਸਮੱਗਰੀ ਬਣਾਓ" },
  ta: { "Dashboard": "டாஷ்போர்டு", "Content Studio": "உள்ளடக்க ஸ்டுடியோ", "Scheduling": "அட்டவணை", "Automation": "தானியக்கம்", "Business": "வணிகம்", "Analytics": "பகுப்பாய்வு", "Account": "கணக்கு", "Billing": "கட்டணம்", "Workspace": "பணியிடம்", "Settings": "அமைப்புகள்", "Connected Accounts": "இணைக்கப்பட்ட கணக்குகள்", "Content Generator": "உள்ளடக்க உருவாக்கி", "Generate Content": "உள்ளடக்கத்தை உருவாக்கு" },
  te: { "Dashboard": "డాష్‌బోర్డ్", "Content Studio": "కంటెంట్ స్టూడియో", "Scheduling": "షెడ్యూలింగ్", "Automation": "ఆటోమేషన్", "Business": "వ్యాపారం", "Analytics": "విశ్లేషణలు", "Account": "ఖాతా", "Billing": "బిల్లింగ్", "Workspace": "కార్యస్థలం", "Settings": "సెట్టింగ్‌లు", "Connected Accounts": "కనెక్ట్ చేసిన ఖాతాలు", "Content Generator": "కంటెంట్ జనరేటర్", "Generate Content": "కంటెంట్ సృష్టించండి" },
  kn: { "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "Content Studio": "ವಿಷಯ ಸ್ಟುಡಿಯೋ", "Scheduling": "ವೇಳಾಪಟ್ಟಿ", "Automation": "ಸ್ವಯಂಚಾಲನೆ", "Business": "ವ್ಯವಹಾರ", "Analytics": "ವಿಶ್ಲೇಷಣೆ", "Account": "ಖಾತೆ", "Billing": "ಬಿಲ್ಲಿಂಗ್", "Workspace": "ಕಾರ್ಯಸ್ಥಳ", "Settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "Connected Accounts": "ಸಂಪರ್ಕಿತ ಖಾತೆಗಳು", "Content Generator": "ವಿಷಯ ಜನರೇಟರ್", "Generate Content": "ವಿಷಯ ರಚಿಸಿ" },
  ml: { "Dashboard": "ഡാഷ്ബോർഡ്", "Content Studio": "ഉള്ളടക്ക സ്റ്റുഡിയോ", "Scheduling": "ഷെഡ്യൂളിംഗ്", "Automation": "ഓട്ടോമേഷൻ", "Business": "ബിസിനസ്", "Analytics": "അനലിറ്റിക്സ്", "Account": "അക്കൗണ്ട്", "Billing": "ബില്ലിംഗ്", "Workspace": "വർക്ക്‌സ്‌പേസ്", "Settings": "ക്രമീകരണങ്ങൾ", "Connected Accounts": "ബന്ധിപ്പിച്ച അക്കൗണ്ടുകൾ", "Content Generator": "ഉള്ളടക്ക ജനറേറ്റർ", "Generate Content": "ഉള്ളടക്കം സൃഷ്ടിക്കുക" },
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
