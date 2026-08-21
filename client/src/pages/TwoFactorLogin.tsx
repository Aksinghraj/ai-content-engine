import { useState } from "react";
import { ShieldCheck, Loader2, Fingerprint } from "lucide-react";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function TwoFactorLogin() {
  const [code, setCode] = useState("");
  const [passkeySupported] = useState(() => browserSupportsWebAuthn());
  const verify = trpc.twoFactor.verifyLogin.useMutation({
    onSuccess: ({ returnPath }) => window.location.assign(returnPath),
    onError: (error) => toast.error(error.message),
  });
  const beginPasskey = trpc.twoFactor.beginPasskeyLogin.useMutation();
  const finishPasskey = trpc.twoFactor.finishPasskeyLogin.useMutation({
    onSuccess: ({ returnPath }) => window.location.assign(returnPath),
    onError: (error) => toast.error(error.message),
  });
  const verifyWithPasskey = async () => {
    try {
      const optionsJSON = await beginPasskey.mutateAsync();
      const response = await startAuthentication({ optionsJSON });
      await finishPasskey.mutateAsync({ response });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not verify that passkey. Try your authenticator code instead.";
      toast.error(message);
    }
  };
  const passkeyBusy = beginPasskey.isPending || finishPasskey.isPending;
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><section className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-semibold text-card-foreground">Confirm it’s you</h1><p className="mt-2 text-sm text-muted-foreground">Use a passkey, enter the six-digit code from your authenticator app, or use a recovery code.</p>{passkeySupported && <Button variant="outline" className="mt-5 w-full border-border" disabled={passkeyBusy || verify.isPending} onClick={verifyWithPasskey}>{passkeyBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4 text-primary" />}Use a passkey</Button>}<div className="my-5 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</div><label className="block text-sm font-medium text-card-foreground" htmlFor="two-factor-code">Authentication code</label><input id="two-factor-code" autoFocus autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, ""))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 font-mono text-lg tracking-[0.25em] text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="000000" /><Button className="mt-4 w-full lumae-gradient-cta" disabled={!code || verify.isPending || passkeyBusy} onClick={() => verify.mutate({ code })}>{verify.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Continue securely</Button><p className="mt-4 text-center text-xs text-muted-foreground">If you cannot access your authenticator, use a recovery code. You can sign in again to restart if this check expires.</p></section></main>;
}
