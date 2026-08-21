import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function VerifyLocalEmail() {
  const [, navigate] = useLocation();
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [verified, setVerified] = useState(false);
  const verify = trpc.localAuth.verifyEmail.useMutation({
    onSuccess: () => { setVerified(true); toast.success("Email confirmed. You can now sign in."); },
    onError: (error) => toast.error(error.message),
  });
  useEffect(() => { if (token) verify.mutate({ token }); }, [token]);
  return <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-[#f5f5f7]"><section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141417] p-7 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">{verified ? <CheckCircle2 className="h-6 w-6 text-[#10b981]" /> : <Mail className="h-6 w-6" />}</div><h1 className="mt-5 text-xl font-semibold">{verified ? "Email confirmed" : "Confirming your email"}</h1><p className="mt-2 text-sm text-[#9a9aa2]">{verified ? "Your secure email/password sign-in is now ready." : token ? "Please wait while we securely confirm your email address." : "This verification link is missing or invalid."}</p>{verify.isPending && <Loader2 className="mx-auto mt-5 h-5 w-5 animate-spin text-primary" />}{!verify.isPending && <Button className="mt-6 lumae-gradient-cta" onClick={() => navigate("/login")}>Continue to sign in</Button>}<p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#6b6b72]"><ShieldCheck className="h-3.5 w-3.5 text-[#10b981]" />Only use verification links from Lumae AI.</p></section></main>;
}
