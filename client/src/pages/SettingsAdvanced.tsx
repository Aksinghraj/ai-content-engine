import { useState } from "react";
import { Database, Globe, Lock, Moon, ShieldCheck, Sun, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { TwoFactorSecurityPanel } from "@/components/TwoFactorSecurityPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { LANGUAGE_OPTIONS, type LanguageCode, useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const themeOptions = [
  { value: "light", label: "Bright" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "System" },
] as const;

export default function SettingsAdvanced() {
  const [tab, setTab] = useState("account");
  const { user } = useAuth();
  const { theme, effectiveTheme, highContrast, setTheme, setHighContrast } = useTheme();
  const { language, setLanguage, isSaving: isSavingLanguage, t } = useLanguage();
  const deleteAccount = trpc.auth.account.deleteAccount.useMutation({
    onSuccess: () => { toast.success("Your account was deleted."); window.location.assign("/login?accountDeleted=1"); },
    onError: (error) => toast.error(error.message || "Could not delete your account."),
  });
  const chosenLanguage = LANGUAGE_OPTIONS.find((option) => option.code === language);
  const chooseLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    const option = LANGUAGE_OPTIONS.find((item) => item.code === nextLanguage);
    toast.success(`${option?.name || "Language"} selected for this account.`);
  };
  const deleteCurrentAccount = () => {
    if (window.prompt("This permanently deletes your Lumae account and associated data. Type DELETE to continue.") === "DELETE") deleteAccount.mutate();
    else toast.message("Account deletion cancelled.");
  };

  return <DashboardLayout><main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 sm:px-6">
    <header><h1 className="text-3xl font-semibold text-foreground">{t("Settings")}</h1><p className="mt-2 text-sm text-muted-foreground">Manage your account, security, and language preference. Features without a verified workflow are not shown as active.</p></header>
    <Tabs value={tab} onValueChange={setTab} className="space-y-5">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted p-1"><TabsTrigger value="account"><UserRound className="mr-2 h-4 w-4" />{t("Account")}</TabsTrigger><TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Security</TabsTrigger><TabsTrigger value="data"><Database className="mr-2 h-4 w-4" />Data</TabsTrigger></TabsList>
      <TabsContent value="account" className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />Account information</CardTitle><CardDescription>These values come from your signed-in Lumae account.</CardDescription></CardHeader><CardContent className="space-y-4"><InfoRow label="Name" value={user?.name || "Not provided"} /><InfoRow label="Email" value={user?.email || "No email on this account"} breakable /><div><p className="text-xs text-muted-foreground">Account role</p><Badge variant="outline" className="mt-1 capitalize">{user?.role || "user"}</Badge></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />Interface language</CardTitle><CardDescription>Select English or an Indian language. The choice is saved securely to your account and also sets the default language for new content.</CardDescription></CardHeader><CardContent className="space-y-3"><Label htmlFor="account-language">Choose your language</Label><Select value={language} onValueChange={(value) => chooseLanguage(value as LanguageCode)} disabled={isSavingLanguage}><SelectTrigger id="account-language"><SelectValue>{chosenLanguage ? `${chosenLanguage.name} · ${chosenLanguage.nativeName}` : "English"}</SelectValue></SelectTrigger><SelectContent className="max-h-80">{LANGUAGE_OPTIONS.map((option) => <SelectItem key={option.code} value={option.code}>{option.name} · {option.nativeName}</SelectItem>)}</SelectContent></Select><p className="text-xs leading-5 text-muted-foreground">Navigation, workspace headings, and settings use reviewed local-language labels where available. Every choice is honored by content generation; Bhojpuri requests are instructed not to switch silently to English.</p></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Appearance and accessibility</CardTitle><CardDescription>Display preferences remain separate from your account language.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="rounded-md border border-border p-4"><div className="flex items-center gap-2"><span className="font-medium text-foreground">Display mode</span>{effectiveTheme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-500" />}</div><div className="mt-3 grid grid-cols-3 gap-2">{themeOptions.map(({ value, label }) => <Button key={value} variant={theme === value ? "default" : "outline"} className={theme === value ? "lumae-gradient-cta" : ""} onClick={() => setTheme(value)}>{label}</Button>)}</div></div><div className="flex items-center justify-between gap-4 rounded-md border border-border p-4"><div><p className="font-medium text-foreground">High contrast</p><p className="mt-1 text-xs text-muted-foreground">Improves text, borders, and focus visibility.</p></div><Button variant={highContrast ? "default" : "outline"} className={highContrast ? "lumae-gradient-cta" : ""} onClick={() => setHighContrast(!highContrast)}>{highContrast ? "Enabled" : "Enable"}</Button></div></CardContent></Card>
      </TabsContent>
      <TabsContent value="security"><TwoFactorSecurityPanel /><Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Session information</CardTitle><CardDescription>Lumae does not display invented device sessions. Use your browser and identity-provider security settings to review active sessions.</CardDescription></CardHeader></Card></TabsContent>
      <TabsContent value="data"><Card><CardHeader><CardTitle>Account data</CardTitle><CardDescription>Data export is not presented until a verified export workflow is available. Account deletion is permanent.</CardDescription></CardHeader><CardContent><Button variant="destructive" onClick={deleteCurrentAccount} disabled={deleteAccount.isPending}>{deleteAccount.isPending ? "Deleting…" : <><Trash2 className="mr-2 h-4 w-4" />Delete account</>}</Button></CardContent></Card></TabsContent>
    </Tabs>
  </main></DashboardLayout>;
}

function InfoRow({ label, value, breakable = false }: { label: string; value: string; breakable?: boolean }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 font-medium text-foreground ${breakable ? "break-all" : ""}`}>{value}</p></div>;
}
