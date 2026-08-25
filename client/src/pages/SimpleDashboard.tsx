import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowUpRight, BarChart3, Calendar, Mail, MessageSquare, Orbit, Settings, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function SimpleDashboard() {
  const { user } = useAuth(); const [, navigate] = useLocation();
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const resendVerification = trpc.auth.resendOtp.useMutation({
    onSuccess: (result) => {
      if (result.alreadyVerified) {
        setConfirmationMessage("This account is already confirmed. Refresh the page to update the account signal.");
      } else if (result.throttled) {
        setConfirmationMessage(`Please wait ${result.retryAfterSeconds ?? 60} seconds before requesting another code.`);
      } else if (result.success) {
        navigate("/verify-email");
      } else {
        setConfirmationMessage("We could not send a confirmation code right now. Please try again shortly.");
      }
    },
    onError: () => setConfirmationMessage("We could not request a confirmation code right now. Please try again shortly."),
  });
  const requestConfirmation = () => {
    resendVerification.mutate();
  };
  const quickActions = [
    { icon: Sparkles, index: "01", label: "Generate", description: "Turn a signal into a first draft.", href: "/content-studio/ai-generator" },
    { icon: Calendar, index: "02", label: "Schedule", description: "Put the next post in motion.", href: "/scheduling/post-scheduling" },
    { icon: Zap, index: "03", label: "Automate", description: "Build repeatable publishing flow.", href: "/automation/social-automation" },
    { icon: BarChart3, index: "04", label: "Measure", description: "Read what the signal is doing.", href: "/analytics/usage" },
    { icon: MessageSquare, index: "05", label: "Ask Lumae", description: "Find the next useful move.", href: "/personal-ai" },
    { icon: Settings, index: "06", label: "Tune", description: "Manage the workspace and access.", href: "/account/settings" },
  ];
  return <DashboardLayout><div className="lumae-dashboard"><section className="lumae-dashboard-hero"><div><p className="lumae-eyebrow"><span className="lumae-live-dot"/>Workspace signal</p><h1>Good to see you, <span>{user?.name || "Creator"}.</span></h1><p>Your next useful publishing move is one clear signal away.</p></div><div className="lumae-balance"><span>Available credits</span><strong>{user?.tokenBalance || 0}</strong><small>Ready when your next idea is.</small></div></section><section className="lumae-dashboard-section"><div className="lumae-section-row"><div><p>Start here</p><h2>Direct your next move</h2></div><button className="lumae-section-row__action" onClick={() => navigate("/content-studio/ai-generator")}>Open Content Studio <ArrowUpRight className="h-4 w-4"/></button></div><div className="lumae-action-grid">{quickActions.map(({ icon: Icon, index, label, description, href }) => <button key={href} onClick={() => navigate(href)} className="lumae-action-tile"><span>{index}</span><Icon className="h-5 w-5"/><h3>{label}</h3><p>{description}</p><ArrowUpRight className="lumae-action-arrow h-4 w-4"/></button>)}</div></section><section className="lumae-dashboard-bottom"><div className="lumae-dashboard-status"><div><p>Account signal</p><h2>{user?.emailVerified ? "Verified and ready" : "Email confirmation pending"}</h2><span>{user?.emailVerified ? "Your workspace is secured for creation and publishing." : "Send a secure 6-digit code to your account email. Signing in cannot confirm email ownership by itself."}</span>{!user?.emailVerified && <><button type="button" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#63e6cf] hover:text-white" disabled={resendVerification.isPending} onClick={requestConfirmation}><Mail className="h-4 w-4" />{resendVerification.isPending ? "Sending code…" : "Send 6-digit code"}</button>{confirmationMessage && <p className="mt-2 text-xs text-[#9bb1b6]" role="status">{confirmationMessage}</p>}</>}</div><div className={`lumae-status-orb ${user?.emailVerified ? "is-ready" : ""}`} /></div><div className="lumae-dashboard-note"><Orbit className="h-6 w-6"/><p><b>Signalfield tip</b> Start broad in the generator, then use Scheduling to carry the same message through your week.</p></div></section></div></DashboardLayout>;
}
