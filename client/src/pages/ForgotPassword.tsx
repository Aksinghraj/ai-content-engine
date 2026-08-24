import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type Feedback = { tone: "error" | "notice" | "success"; message: string } | null;

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const requestReset = trpc.localAuth.requestPasswordReset.useMutation({
    onSuccess: ({ status, retryAfterSeconds }) => {
      if (status === "oauth_only") {
        const message = "If you created this account with Google or another sign-in provider, continue with that method. Password reset is available only for email/password accounts.";
        setFeedback({ tone: "notice", message });
        toast.message(message);
      } else if (status === "delivery_unavailable") {
        const message = "We could not send a reset email. Please try again later.";
        setFeedback({ tone: "error", message });
        toast.error(message);
      } else if (status === "throttled") {
        const message = `Please wait about ${Math.max(1, Math.ceil((retryAfterSeconds ?? 60) / 60))} minute before requesting another reset email.`;
        setFeedback({ tone: "notice", message });
        toast.message(message);
      } else {
        setSent(true);
        setFeedback({ tone: "success", message: "If an email/password account exists, a reset email has been accepted for delivery. Check your inbox and spam folder." });
        toast.success("If an email/password account exists, a reset email has been accepted for delivery.");
      }
    },
    onError: (error) => {
      setFeedback({ tone: "error", message: error.message });
      toast.error(error.message);
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (requestReset.isPending) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!validEmail(normalizedEmail)) {
      setFeedback({ tone: "error", message: "Enter a valid email address before requesting a reset link." });
      return;
    }
    setFeedback(null);
    requestReset.mutate({ email: normalizedEmail });
  };

  const feedbackClass = feedback?.tone === "error"
    ? "border-[#ff6b5f]/60 bg-[#ff6b5f]/10 text-[#ffd0cc]"
    : feedback?.tone === "success"
      ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#d1fae5]"
      : "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#c5fff7]";

  return <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-[#f5f5f7]">
    <section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141417] p-7">
      <button type="button" onClick={() => navigate("/login")} className="inline-flex items-center gap-2 text-sm text-[#9a9aa2] hover:text-white"><ArrowLeft className="h-4 w-4" />Back to sign in</button>
      <div className="mt-6 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><Mail className="h-5 w-5" /></div><h1 className="mt-4 text-xl font-semibold">Reset your password</h1><p className="mt-2 text-sm leading-6 text-[#9a9aa2]">We’ll send a secure, single-use link that expires in 30 minutes for email/password accounts.</p></div>
      {feedback && <p className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${feedbackClass}`} role={feedback.tone === "error" ? "alert" : "status"}>{feedback.message}</p>}
      {sent ? <button type="button" onClick={() => navigate("/login")} className="mt-4 w-full rounded-xl border border-white/15 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/5">Back to sign in</button> : <form className="mt-6 space-y-4" noValidate onSubmit={submit}><label className="block text-sm font-medium">Email<input value={email} onChange={(event) => { setEmail(event.target.value); if (feedback) setFeedback(null); }} type="email" autoComplete="email" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#09090b] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#8b5cf6]" placeholder="you@example.com" aria-invalid={feedback?.tone === "error"} /></label><Button type="submit" disabled={requestReset.isPending} aria-busy={requestReset.isPending} className="w-full lumae-gradient-cta">{requestReset.isPending ? "Checking secure delivery…" : "Send secure reset link"}</Button></form>}
      <p className="mt-5 flex gap-2 text-xs leading-5 text-[#9a9aa2]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#10b981]" />Password resets invalidate all existing email/password sessions for your account.</p>
    </section>
  </main>;
}
