import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") || "", []);
  const [password, setPassword] = useState("");
  const [complete, setComplete] = useState(false);
  const reset = trpc.localAuth.resetPassword.useMutation({ onSuccess: () => { setComplete(true); toast.success("Password updated. Please sign in again."); }, onError: (error) => toast.error(error.message) });
  return <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-[#f5f5f7]"><section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141417] p-7 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">{complete ? <CheckCircle2 className="h-5 w-5 text-[#10b981]" /> : <KeyRound className="h-5 w-5" />}</div><h1 className="mt-4 text-xl font-semibold">{complete ? "Password updated" : "Choose a new password"}</h1>{complete ? <><p className="mt-2 text-sm text-[#9a9aa2]">All prior email/password sessions are now invalid. Sign in again to continue.</p><Button className="mt-6 lumae-gradient-cta" onClick={() => navigate("/login")}>Continue to sign in</Button></> : !token ? <><p className="mt-2 text-sm text-[#9a9aa2]">This reset link is missing or invalid.</p><Button className="mt-6" variant="outline" onClick={() => navigate("/forgot-password")}>Request a new link</Button></> : <form className="mt-6 space-y-4 text-left" onSubmit={(event) => { event.preventDefault(); reset.mutate({ token, password }); }}><label className="block text-sm font-medium">New password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" required className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#09090b] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#8b5cf6]" placeholder="12+ characters" /></label><p className="text-xs leading-5 text-[#9a9aa2]">Use 12+ characters with upper- and lowercase letters, a number, and a symbol.</p><Button disabled={reset.isPending} className="w-full lumae-gradient-cta">Update password securely</Button></form>}<p className="mt-5 flex gap-2 text-left text-xs leading-5 text-[#9a9aa2]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#10b981]" />Never share a reset link or code with anyone.</p></section></main>;
}
