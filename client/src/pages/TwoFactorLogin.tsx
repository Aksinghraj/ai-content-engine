import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function TwoFactorLogin() {
  const [code, setCode] = useState("");
  const verify = trpc.twoFactor.verifyLogin.useMutation({
    onSuccess: ({ returnPath }) => window.location.assign(returnPath),
    onError: (error) => toast.error(error.message),
  });
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><section className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-semibold text-card-foreground">Confirm it’s you</h1><p className="mt-2 text-sm text-muted-foreground">Enter the six-digit code from your authenticator app, or one of your recovery codes.</p><label className="mt-6 block text-sm font-medium text-card-foreground" htmlFor="two-factor-code">Authentication code</label><input id="two-factor-code" autoFocus autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, ""))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 font-mono text-lg tracking-[0.25em] text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="000000" /><Button className="mt-4 w-full lumae-gradient-cta" disabled={!code || verify.isPending} onClick={() => verify.mutate({ code })}>{verify.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Continue securely</Button><p className="mt-4 text-center text-xs text-muted-foreground">If you cannot access your authenticator, use a recovery code. You can sign in again to restart if this check expires.</p></section></main>;
}
