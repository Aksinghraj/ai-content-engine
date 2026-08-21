import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type Mode = "signin" | "register";

function GoogleMark() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
}

function passwordStrength(password: string) {
  const checks = [password.length >= 12, /[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Strong"];
  const colors = ["", "bg-[#ef4444]", "bg-[#f59e0b]", "bg-[#06b6d4]", "bg-[#10b981]", "bg-[#10b981]"];
  return { score, label: labels[score], color: colors[score] };
}

export default function LoginEnhanced() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  const googleLoginUrl = "/api/oauth/google/login";
  const register = trpc.localAuth.register.useMutation({
    onSuccess: (result) => {
      setRegistrationPending(true);
      toast.success(result.emailDeliveryAvailable ? "Check your inbox to verify your email." : "Account created. Email delivery is temporarily unavailable; try resending verification later.");
    },
    onError: (error) => toast.error(error.message),
  });
  const login = trpc.localAuth.login.useMutation({
    onSuccess: ({ returnPath }) => window.location.assign(returnPath),
    onError: (error) => toast.error(error.message),
  });
  const resend = trpc.localAuth.resendVerification.useMutation({ onSuccess: () => toast.success("If an unverified account exists, a new verification email has been requested.") });

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, loading, navigate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "register") register.mutate({ name, email, password });
    else login.mutate({ email, password, rememberMe });
  };
  const busy = register.isPending || login.isPending;
  const strength = passwordStrength(password);
  const strengthColor = strength.score >= 4 ? "text-[#10b981]" : strength.score >= 3 ? "text-[#06b6d4]" : strength.score >= 2 ? "text-[#f59e0b]" : "text-[#ef4444]";

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-10 text-[#f5f5f7]">
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,rgba(255,255,255,0.16),transparent_16%),radial-gradient(circle_at_100%_0%,rgba(148,163,184,0.14),transparent_28%),linear-gradient(115deg,#09090b_12%,#141417_52%,#09090b_100%)]" />
    <div aria-hidden="true" className="absolute -right-24 -top-24 h-[38rem] w-[25rem] rotate-[-24deg] rounded-[45%] border border-white/10 bg-gradient-to-b from-white/15 via-white/[0.035] to-transparent blur-[1px]" />
    <button onClick={() => navigate("/")} className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm text-[#9a9aa2] transition-colors hover:text-[#f5f5f7]"><ArrowLeft className="h-4 w-4" />Back to home</button>
    <section className="relative z-10 w-full max-w-sm">
      <div className="mb-7 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#141417] shadow-lg"><Sparkles className="h-5 w-5 text-[#a78bfa]" /></div><h1 className="mt-4 text-2xl font-semibold tracking-tight">Lumae AI</h1><p className="mt-1 text-sm text-[#9a9aa2]">Securely create and manage your content.</p></div>
      <div className="rounded-2xl border border-white/10 bg-[#141417]/90 p-6 shadow-2xl backdrop-blur">
        <div className="flex rounded-xl border border-white/10 bg-[#09090b]/70 p-1"><button onClick={() => { setMode("signin"); setRegistrationPending(false); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === "signin" ? "bg-white/10 text-white" : "text-[#9a9aa2] hover:text-white"}`}>Sign in</button><button onClick={() => { setMode("register"); setRegistrationPending(false); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-white/10 text-white" : "text-[#9a9aa2] hover:text-white"}`}>Create account</button></div>
        {registrationPending ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-[#10b981]" /><h2 className="mt-4 text-xl font-semibold">Confirm your email</h2><p className="mt-2 text-sm leading-6 text-[#9a9aa2]">We sent a 30-minute verification link to <span className="text-[#f5f5f7]">{email}</span>. Verify it before using email/password sign-in.</p><Button variant="outline" className="mt-5 border-white/10" disabled={resend.isPending} onClick={() => resend.mutate({ email })}>Resend verification</Button></div> : <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "register" && <label className="block text-sm font-medium">Name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={120} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#09090b] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#6b6b72] focus:ring-2 focus:ring-[#8b5cf6]" placeholder="Your name" /></label>}
          <label className="block text-sm font-medium">Email<div className="relative mt-1.5"><Mail className="absolute left-3 top-3 h-4 w-4 text-[#9a9aa2]" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="w-full rounded-xl border border-white/10 bg-[#09090b] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6b6b72] focus:ring-2 focus:ring-[#8b5cf6]" placeholder="you@example.com" /></div></label>
          <label className="block text-sm font-medium">Password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-[#9a9aa2]" /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} required className="w-full rounded-xl border border-white/10 bg-[#09090b] py-2.5 pl-10 pr-10 text-sm text-white outline-none placeholder:text-[#6b6b72] focus:ring-2 focus:ring-[#8b5cf6]" placeholder={mode === "register" ? "12+ characters" : "Your password"} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-3 text-[#9a9aa2] hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            {mode === "register" && <div className="mt-2" aria-live="polite"><div className="flex items-center justify-between text-xs"><span className="text-[#9a9aa2]">Password strength</span><span className={strengthColor}>{password ? strength.label : "Add a password"}</span></div><div className="mt-1.5 grid grid-cols-5 gap-1">{Array.from({ length: 5 }, (_, index) => <span key={index} className={`h-1 rounded-full ${index < strength.score ? strength.color : "bg-white/10"}`} />)}</div><p className="mt-1.5 text-xs text-[#9a9aa2]">Use 12+ characters with upper- and lowercase letters, a number, and a symbol.</p></div>}
          </label>
          {mode === "signin" && <label className="flex cursor-pointer items-start gap-2 text-sm text-[#d4d4d8]"><input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[#09090b] accent-[#8b5cf6]" /><span>Remember me for 30 days<span className="mt-0.5 block text-xs text-[#9a9aa2]">Leave unchecked on shared devices. Your session ends when the browser closes or after 12 hours.</span></span></label>}
          <Button type="submit" disabled={busy} className="w-full lumae-gradient-cta">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === "register" ? "Create secure account" : "Continue with email"}</Button>
        </form>}
        <div className="my-5 flex items-center gap-3 text-xs text-[#6b6b72] before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">or</div>
        <Button variant="outline" type="button" className="w-full border-white/10 bg-white text-[#141417] hover:bg-white/90" onClick={() => window.location.assign(googleLoginUrl)}><GoogleMark />Continue with Google</Button>
        <Button variant="outline" type="button" disabled className="mt-3 w-full border-white/10 text-[#9a9aa2]"><Phone className="mr-2 h-4 w-4" />Phone OTP coming soon</Button><p className="mt-2 text-center text-xs text-[#6b6b72]">Phone OTP will activate after an SMS provider is configured.</p>
        <div className="mt-5 flex gap-2 rounded-xl border border-white/10 bg-[#09090b]/70 p-3 text-xs leading-5 text-[#9a9aa2]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />Email/password sign-in uses strong password hashing and requires email confirmation. Existing accounts can continue with Google.</div>
      </div>
      <p className="mt-5 text-center text-xs text-[#6b6b72]">By continuing, you agree to Lumae’s Terms and Privacy Policy.</p>
    </section>
  </main>;
}
