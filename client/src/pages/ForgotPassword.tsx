import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const requestReset = trpc.localAuth.requestPasswordReset.useMutation({
    onSuccess: ({ status, retryAfterSeconds }) => {
      if (status === "oauth_only") toast.message("This account uses an external sign-in method. Please continue with Google or its original provider.");
      else if (status === "delivery_unavailable") toast.error("Email delivery is temporarily unavailable. Please try again later.");
      else if (status === "throttled") toast.message(`Please wait about ${Math.max(1, Math.ceil((retryAfterSeconds ?? 60) / 60))} minute before requesting another reset email.`);
      else { setSent(true); toast.success("If a password account exists, a reset email is on its way."); }
    },
    onError: (error) => toast.error(error.message),
  });
  return <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-[#f5f5f7]"><section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141417] p-7"><button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 text-sm text-[#9a9aa2] hover:text-white"><ArrowLeft className="h-4 w-4" />Back to sign in</button><div className="mt-6 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><Mail className="h-5 w-5" /></div><h1 className="mt-4 text-xl font-semibold">Reset your password</h1><p className="mt-2 text-sm leading-6 text-[#9a9aa2]">We’ll send a secure, single-use link that expires in 30 minutes.</p></div>{sent ? <div className="mt-6 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-4 text-sm text-[#d1fae5]">Check your inbox and spam folder. For security, the link expires after 30 minutes and can only be used once.</div> : <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); requestReset.mutate({ email }); }}><label className="block text-sm font-medium">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#09090b] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#8b5cf6]" placeholder="you@example.com" /></label><Button disabled={requestReset.isPending} className="w-full lumae-gradient-cta">Send secure reset link</Button></form>}<p className="mt-5 flex gap-2 text-xs leading-5 text-[#9a9aa2]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#10b981]" />Password resets invalidate all existing email/password sessions for your account.</p></section></main>;
}
