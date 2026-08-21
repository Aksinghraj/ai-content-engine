import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, KeyRound, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TwoFactorSecurityPanel() {
  const utils = trpc.useUtils();
  const { data: status, isLoading } = trpc.twoFactor.status.useQuery();
  const [setup, setSetup] = useState<{ otpauthUri: string; manualKey: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);

  const beginSetup = trpc.twoFactor.beginSetup.useMutation({
    onSuccess: (result) => {
      setSetup(result);
      setVerificationCode("");
      setRecoveryCodes(null);
      setCodesAcknowledged(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const confirmSetup = trpc.twoFactor.confirmSetup.useMutation({
    onSuccess: async (result) => {
      setRecoveryCodes(result.recoveryCodes);
      setSetup(null);
      setVerificationCode("");
      await utils.twoFactor.status.invalidate();
      toast.success("Two-factor authentication is now protecting your account.");
    },
    onError: (error) => toast.error(error.message),
  });
  const disable = trpc.twoFactor.disable.useMutation({
    onSuccess: async () => {
      setDisableCode("");
      await utils.twoFactor.status.invalidate();
      toast.success("Two-factor authentication has been disabled.");
    },
    onError: (error) => toast.error(error.message),
  });

  const copyManualKey = async () => {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.manualKey);
    toast.success("Setup key copied.");
  };

  if (isLoading) {
    return <Card className="border-border bg-card p-6"><div className="flex items-center gap-3 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading two-factor security…</div></Card>;
  }

  if (recoveryCodes) {
    return (
      <Card className="border-[#10b981]/35 bg-card p-6">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#10b981]" /><div><h3 className="font-semibold text-card-foreground">Save your recovery codes</h3><p className="mt-1 text-sm text-muted-foreground">Store these one-time codes somewhere safe. They will not be shown again.</p></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground sm:grid-cols-4">{recoveryCodes.map((code) => <span key={code}>{code}</span>)}</div>
        <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={codesAcknowledged} onChange={(event) => setCodesAcknowledged(event.target.checked)} className="mt-0.5 accent-primary" />I have saved these recovery codes securely.</label>
        <Button className="mt-4 lumae-gradient-cta" disabled={!codesAcknowledged} onClick={() => setRecoveryCodes(null)}>Done</Button>
      </Card>
    );
  }

  if (setup) {
    return (
      <Card className="border-border bg-card p-6">
        <div className="flex gap-3"><Smartphone className="mt-0.5 h-5 w-5 text-primary" /><div><h3 className="font-semibold text-card-foreground">Connect your authenticator app</h3><p className="mt-1 text-sm text-muted-foreground">Scan this code with Google Authenticator, Microsoft Authenticator, 1Password, or another TOTP-compatible app.</p></div></div>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="w-fit rounded-xl bg-white p-3"><QRCodeSVG value={setup.otpauthUri} size={164} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Manual setup key</p><div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background p-2"><code className="min-w-0 flex-1 break-all text-sm text-foreground">{setup.manualKey}</code><Button type="button" variant="ghost" size="icon" aria-label="Copy manual setup key" onClick={copyManualKey}><Copy className="h-4 w-4" /></Button></div><label className="mt-4 block text-sm font-medium text-card-foreground">Enter the six-digit code</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono tracking-[0.28em] text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="000000" /><div className="mt-3 flex gap-2"><Button className="lumae-gradient-cta" disabled={verificationCode.length !== 6 || confirmSetup.isPending} onClick={() => confirmSetup.mutate({ code: verificationCode })}>{confirmSetup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Verify & enable</Button><Button variant="outline" className="border-border" onClick={() => setSetup(null)}>Cancel</Button></div></div></div>
      </Card>
    );
  }

  if (status?.enabled) {
    return (
      <Card className="border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-[#10b981]" /><div><h3 className="font-semibold text-card-foreground">Two-factor authentication</h3><p className="mt-1 text-sm text-muted-foreground">Your authenticator app is required after sign-in. {status.recoveryCodesRemaining} recovery codes remain.</p></div></div><span className="rounded-full bg-[#10b981]/15 px-2.5 py-1 text-xs font-medium text-[#10b981]">Enabled</span></div>
        <div className="mt-5 rounded-xl border border-border bg-muted/25 p-4"><p className="font-medium text-card-foreground">Disable two-factor authentication</p><p className="mt-1 text-xs text-muted-foreground">Enter a current authenticator or recovery code to confirm this security-sensitive change.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={disableCode} onChange={(event) => setDisableCode(event.target.value.replace(/\s/g, ""))} className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="Authenticator or recovery code" /><Button variant="outline" className="border-[#ef4444]/45 text-[#ef4444] hover:bg-[#ef4444]/10" disabled={!disableCode || disable.isPending} onClick={() => disable.mutate({ code: disableCode })}>{disable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Disable</Button></div></div>
      </Card>
    );
  }

  return <Card className="border-border bg-card p-6"><div className="flex gap-3"><KeyRound className="mt-0.5 h-5 w-5 text-primary" /><div><h3 className="font-semibold text-card-foreground">Two-factor authentication</h3><p className="mt-1 text-sm text-muted-foreground">Add an authenticator app code after sign-in to protect your account, even if someone learns your password.</p><Button className="mt-4 lumae-gradient-cta" disabled={beginSetup.isPending} onClick={() => beginSetup.mutate()}>{beginSetup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Set up two-factor authentication</Button></div></div></Card>;
}
