import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowUpRight, BarChart3, Calendar, CheckCircle2, Mail, MessageSquare, Orbit, Settings, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function SimpleDashboard() {
  const { user } = useAuth(); const [, navigate] = useLocation();
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const resendVerification = trpc.localAuth.resendVerification.useMutation({
    onSuccess: () => setConfirmationMessage("If this is an email/password account, a fresh confirmation link is on its way."),
    onError: () => setConfirmationMessage("We could not request a new link right now. Please try again shortly."),
  });
  const usesGoogle = user?.loginMethod === "google";
  const requestConfirmation = () => {
    if (usesGoogle) {
      window.location.assign("/api/oauth/google/login?returnPath=/dashboard");
      return;
    }
    if (user?.email) resendVerification.mutate({ email: user.email });
  };
  const quickActions = [
    { icon: Sparkles, index: "01", label: "Generate", description: "Turn a signal into a first draft.", href: "/content-studio/ai-generator" },
    { icon: Calendar, index: "02", label: "Schedule", description: "Put the next post in motion.", href: "/scheduling/post-scheduling" },
    { icon: Zap, index: "03", label: "Automate", description: "Build repeatable publishing flow.", href: "/automation/social-automation" },
    { icon: BarChart3, index: "04", label: "Measure", description: "Read what the signal is doing.", href: "/analytics/usage" },
    { icon: MessageSquare, index: "05", label: "Ask Lumae", description: "Find the next useful move.", href: "/personal-ai" },
    { icon: Settings, index: "06", label: "Tune", description: "Manage the workspace and access.", href: "/account/settings" },
  ];
  return <DashboardLayout><div className="lumae-dashboard"><section className="lumae-dashboard-hero"><div><p className="lumae-eyebrow"><span className="lumae-live-dot"/> WORKSPACE SIGNAL</p><h1>Good to see you, <span>{user?.name || "Creator"}.</span></h1><p>Your next useful publishing move is one clear signal away.</p></div><div className="lumae-balance"><span>Available credits</span><strong>{user?.tokenBalance || 0}</strong><small>Ready when your next idea is.</small></div></section><section className="lumae-dashboard-section"><div className="lumae-section-row"><div><p>START HERE</p><h2>Direct your next move</h2></div><button onClick={() => navigate("/content-studio/ai-generator")}>Open content studio <ArrowUpRight className="h-4 w-4"/></button></div><div className="lumae-action-grid">{quickActions.map(({ icon: Icon, index, label, description, href }) => <button key={href} onClick={() => navigate(href)} className="lumae-action-tile"><span>{index}</span><Icon className="h-5 w-5"/><h3>{label}</h3><p>{description}</p><ArrowUpRight className="lumae-action-arrow h-4 w-4"/></button>)}</div></section><section className="lumae-dashboard-bottom"><div className="lumae-dashboard-status"><div><p>ACCOUNT SIGNAL</p><h2>{user?.emailVerified ? "Verified and ready" : "Email confirmation pending"}</h2><span>{user?.emailVerified ? "Your workspace is secured for creation and publishing." : usesGoogle ? "Continue with Google once more to confirm the email Google has verified for this account." : "Confirm your email from the secure link we send. A password by itself cannot prove email ownership."}</span>{!user?.emailVerified && <><button type="button" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#63e6cf] hover:text-white" disabled={resendVerification.isPending} onClick={requestConfirmation}>{usesGoogle ? <CheckCircle2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}{usesGoogle ? "Continue with Google" : resendVerification.isPending ? "Requesting link…" : "Send confirmation link"}</button>{confirmationMessage && <p className="mt-2 text-xs text-[#9bb1b6]" role="status">{confirmationMessage}</p>}</>}</div><div className={`lumae-status-orb ${user?.emailVerified ? "is-ready" : ""}`} /></div><div className="lumae-dashboard-note"><Orbit className="h-6 w-6"/><p><b>Signalfield tip</b> Start broad in the generator, then use Scheduling to carry the same message through your week.</p></div></section></div></DashboardLayout>;
}
