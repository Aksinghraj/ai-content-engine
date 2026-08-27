import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle2, Link2, Loader2, RefreshCw, ShieldCheck, Unlink2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc, trpcClient } from "@/lib/trpc";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", description: "Connect an Instagram professional account for publishing." },
  { id: "facebook", name: "Facebook", icon: "👥", description: "Connect a Facebook Page for publishing." },
  { id: "twitter", name: "Twitter / X", icon: "𝕏", description: "Connection can be set up; execution needs an approved API budget." },
  { id: "linkedin", name: "LinkedIn", icon: "💼", description: "Connect a LinkedIn profile for text publishing." },
  { id: "youtube", name: "YouTube", icon: "📺", description: "Connect a YouTube channel for private video uploads." },
  { id: "tiktok", name: "TikTok", icon: "🎵", description: "Connect a TikTok account when provider access is available." },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];
type Connection = { id: number; platform: string; username: string; isConnected?: boolean; isValidated: boolean; autoPost: boolean; canEnableAutoPost?: boolean; tokenExpiresAt: Date | string | null; validationError?: string | null };

const PROVIDER_GUIDANCE: Partial<Record<PlatformId, string>> = {
  facebook: "Connect a Facebook account that can create content on exactly one Page. Customer connections need Meta review and Page permissions.",
  instagram: "While the Meta app is unpublished, only app-role testers can connect. Customer connections need Meta Business Verification, App Review, and Live mode.",
  twitter: "X uses paid API credits. You can connect an account, but the owner must approve the API budget before publishing or Auto-Post is available.",
  linkedin: "Requires the OpenID Connect and Share on LinkedIn products with the exact callback registered in LinkedIn. Current publishing supports text posts.",
  youtube: "Enable YouTube Data API v3 and add the connecting Google account as a test user while the Google consent screen is in Testing.",
};

function statusFor(connection: Connection | undefined) {
  if (!connection || connection.isConnected === false) return { tone: "neutral", label: "Not connected", detail: "Connect this account to make it available in Lumae." } as const;
  if (!connection.isValidated) return { tone: "warning", label: "Reconnect needed", detail: connection.validationError || "Lumae could not validate this connection. Reconnect before publishing." } as const;
  if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt).getTime() <= Date.now()) return { tone: "warning", label: "Token expired", detail: "Reconnect this account before publishing or enabling Auto-Post." } as const;
  if (connection.canEnableAutoPost === false) return { tone: "warning", label: "Budget approval needed", detail: "X publishing is pay-per-use and remains disabled until the owner approves its API budget." } as const;
  if (!connection.autoPost) return { tone: "warning", label: "Auto-Post off", detail: "This connection is valid. Enable Auto-Post to use scheduled publishing." } as const;
  return { tone: "ready", label: "Ready", detail: "Connected, validated, and approved for scheduled publishing." } as const;
}

export default function ConnectedAccounts() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const accountsQuery = trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();
  const disconnect = trpc.socialOAuthIntegration.disconnectAccount.useMutation();
  const refresh = trpc.socialOAuthIntegration.refreshToken.useMutation();
  const setAutoPost = trpc.socialOAuthIntegration.setAutoPost.useMutation();
  const accounts = accountsQuery.data ?? [];
  const accountByPlatform = useMemo(() => new Map(accounts.map((account) => [account.platform, account as Connection])), [accounts]);

  useEffect(() => {
    const refreshOnFocus = () => void accountsQuery.refetch();
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [accountsQuery]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get("platform");
    if (params.get("success") && platform) {
      toast.success(`${platform} authorization completed. Lumae is now verifying the connection.`);
      void accountsQuery.refetch();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get("error")) {
      const message = params.get("message") || "The provider did not complete the connection.";
      const guidance = platform ? PROVIDER_GUIDANCE[platform as PlatformId] : undefined;
      toast.error(guidance ? `${message} ${guidance}` : message);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [accountsQuery]);

  const connect = async (platform: PlatformId) => {
    setConnecting(platform);
    const providerWindow = window.open("about:blank", "_blank");
    if (providerWindow) providerWindow.opener = null;
    try {
      const result = await trpcClient.socialOAuthIntegration.getAuthorizationUrl.mutate({ platform });
      if (!result?.url) throw new Error("The provider did not return an authorization address.");
      if (providerWindow) providerWindow.location.replace(result.url);
      else window.location.assign(result.url);
    } catch (error) {
      if (providerWindow && providerWindow !== window) providerWindow.close();
      toast.error(error instanceof Error ? error.message : `Unable to start ${platform} authorization.`);
      setConnecting(null);
    }
  };

  const disconnectAccount = async (platform: PlatformId) => {
    setDisconnecting(platform);
    try {
      await disconnect.mutateAsync({ platform });
      await accountsQuery.refetch();
      toast.success(`${PLATFORMS.find((item) => item.id === platform)?.name} was disconnected and its stored tokens were removed.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to disconnect this account."); }
    finally { setDisconnecting(null); }
  };

  const refreshAccount = async (platform: PlatformId) => {
    try {
      await refresh.mutateAsync({ platform });
      await accountsQuery.refetch();
      toast.success(`${PLATFORMS.find((item) => item.id === platform)?.name} token refreshed.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to refresh this token. Reconnect the account if needed."); }
  };

  const toggleAutoPost = async (platform: PlatformId, enabled: boolean) => {
    try {
      await setAutoPost.mutateAsync({ platform, enabled });
      await accountsQuery.refetch();
      toast.success(`Auto-Post ${enabled ? "enabled" : "disabled"} for ${PLATFORMS.find((item) => item.id === platform)?.name}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Auto-Post could not be updated."); }
  };

  return <DashboardLayout><main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
    <header className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Scheduling</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Connected accounts</h1><p className="max-w-3xl text-sm leading-6 text-muted-foreground">Lumae shows real account validation and token status. Auto-Post can be switched on only after a successful provider validation.</p></header>
    {accountsQuery.isLoading ? <Card className="border-border bg-card p-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /><p className="mt-3 text-sm">Checking connected accounts</p></Card> : <section className="grid grid-cols-1 gap-4 md:grid-cols-2">{PLATFORMS.map((platform) => {
      const account = accountByPlatform.get(platform.id); const status = statusFor(account); const busy = connecting === platform.id || disconnecting === platform.id;
      const statusClass = status.tone === "ready" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" : status.tone === "warning" ? "border-amber-500/40 bg-amber-500/10 text-amber-500" : "text-muted-foreground";
      const canToggle = Boolean(account?.isConnected && account.isValidated && account.canEnableAutoPost !== false && (!account.tokenExpiresAt || new Date(account.tokenExpiresAt).getTime() > Date.now()));
      return <Card key={platform.id} className="flex min-h-72 flex-col border-border bg-card text-card-foreground"><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><span className="text-2xl" aria-hidden="true">{platform.icon}</span><div><CardTitle className="text-base">{platform.name}</CardTitle><CardDescription className="mt-1 text-xs leading-5">{platform.description}</CardDescription></div></div><Badge variant="outline" className={statusClass}>{status.tone === "ready" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : status.tone === "warning" ? <AlertCircle className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}{status.label}</Badge></div></CardHeader><CardContent className="flex flex-1 flex-col gap-3"><div className="min-h-16 rounded-md border border-border bg-background/40 p-3 text-xs leading-5 text-muted-foreground">{account?.username && <p className="mb-1 text-sm font-medium text-foreground">@{account.username}</p>}<p>{status.detail}</p>{account?.tokenExpiresAt && status.tone !== "neutral" && <p className="mt-1">Token expiry: {new Date(account.tokenExpiresAt).toLocaleDateString()}</p>}</div>{account ? <><div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"><div><p className="text-sm font-medium">Auto-Post</p><p className="text-xs text-muted-foreground">Required for scheduled publishing</p></div><Switch checked={Boolean(account.autoPost)} disabled={!canToggle || setAutoPost.isPending} onCheckedChange={(enabled) => toggleAutoPost(platform.id, enabled)} aria-label={`Toggle Auto-Post for ${platform.name}`} /></div>{!canToggle && <p className="text-xs text-amber-500">{account.canEnableAutoPost === false ? PROVIDER_GUIDANCE.twitter : "Reconnect and validate this account before Auto-Post can be enabled."}</p>}<div className="mt-auto grid grid-cols-2 gap-2"><Button type="button" variant="outline" size="sm" onClick={() => refreshAccount(platform.id)} disabled={busy || refresh.isPending}><RefreshCw className="mr-1.5 h-4 w-4" />Refresh</Button><Button type="button" variant="outline" size="sm" className="border-destructive/40 text-destructive hover:text-destructive" onClick={() => disconnectAccount(platform.id)} disabled={busy}>{disconnecting === platform.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Unlink2 className="mr-1.5 h-4 w-4" />}Disconnect</Button></div></> : <><div className="min-h-9 text-xs text-amber-500">{PROVIDER_GUIDANCE[platform.id] || "Provider approval may be required before connection is available."}</div><Button type="button" className="mt-auto w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90" onClick={() => connect(platform.id)} disabled={busy}>{connecting === platform.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}{connecting === platform.id ? "Opening provider…" : "Connect"}</Button></>}</CardContent></Card>;
    })}</section>}
    <Card className="border-primary/30 bg-primary/5 text-card-foreground"><CardContent className="flex gap-3 p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div className="text-sm leading-6"><p className="font-medium">What Lumae checks</p><p className="text-muted-foreground">Account identity and permissions are validated server-side. Tokens stay encrypted, are never displayed in this page, and are removed when you disconnect. A provider or app-review restriction may still prevent a connection from becoming ready.</p></div></CardContent></Card>
  </main></DashboardLayout>;
}
