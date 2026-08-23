import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpRight, CheckCircle2, Layers3, LogOut, Orbit, ScanLine, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const LOGO_URL = "/manus-storage/lumae-logo-icon_ccacaad9.jpg";

function LumaeLogo() {
  return (
    <div className="lumae-brand-lockup">
      <img src={LOGO_URL} alt="Lumae AI" width={34} height={34} className="lumae-brand-mark" />
      <span>Lumae<span className="lumae-brand-dot">.</span></span>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const signedIn = Boolean(isAuthenticated && user);
  const workflowRef = useRef<HTMLElement>(null);
  const [workflowVisible, setWorkflowVisible] = useState(false);

  useEffect(() => {
    const node = workflowRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWorkflowVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const startFree = () => {
    if (signedIn) {
      navigate("/content-studio/ai-generator");
      return;
    }
    window.location.href = getLoginUrl();
  };

  const signOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <main className="lumae-public-shell min-h-dvh overflow-x-hidden">
      <header className="lumae-public-nav">
        <div className="lumae-public-nav__inner">
          <button onClick={() => navigate("/")} className="text-left" aria-label="Lumae home"><LumaeLogo /></button>
          <nav className="lumae-public-nav__links" aria-label="Primary navigation">
            <button onClick={() => navigate("/blog")}>Journal</button>
            <button onClick={() => navigate("/pricing")}>Plans</button>
            {signedIn ? (
              <>
                <Button onClick={() => navigate("/dashboard")} className="lumae-signal-button">Open workspace <ArrowUpRight className="h-4 w-4" /></Button>
                <button className="lumae-nav-quiet" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => (window.location.href = getLoginUrl())}>Log in</button>
                <Button onClick={startFree} className="lumae-signal-button">Start creating <ArrowUpRight className="h-4 w-4" /></Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="lumae-signal-hero">
        <div className="lumae-signal-hero__grid" aria-hidden="true" />
        <div className="lumae-signal-hero__inner">
          <div className="lumae-eyebrow"><span className="lumae-live-dot" /> SIGNALFIELD FOR CREATORS</div>
          <div className="lumae-hero-layout">
            <div className="lumae-hero-copy">
              <h1>One clear signal.<br /><span>Every channel aligned.</span></h1>
              <p>Build content that sounds like you, travels further, and stays organized from first thought to final post.</p>
              <div className="lumae-hero-actions">
                <Button onClick={startFree} className="lumae-signal-button lumae-signal-button--large">{signedIn ? "Create in your workspace" : "Build your first signal"} <ArrowUpRight className="h-4 w-4" /></Button>
                <button onClick={() => navigate("/pricing")} className="lumae-text-link">Explore the system <span>↗</span></button>
              </div>
              <div className="lumae-trust-line"><CheckCircle2 className="h-4 w-4" /> Three free generations <span /> <CheckCircle2 className="h-4 w-4" /> No card required</div>
            </div>
            <div className="lumae-signal-map" aria-label="Lumae content signal illustration">
              <div className="lumae-map-label lumae-map-label--source">YOUR IDEA</div>
              <div className="lumae-map-core"><span>L</span></div>
              <div className="lumae-map-orbit lumae-map-orbit--one"><span>IG</span></div>
              <div className="lumae-map-orbit lumae-map-orbit--two"><span>IN</span></div>
              <div className="lumae-map-orbit lumae-map-orbit--three"><span>X</span></div>
              <div className="lumae-map-orbit lumae-map-orbit--four"><span>YT</span></div>
              <div className="lumae-map-line lumae-map-line--a" /><div className="lumae-map-line lumae-map-line--b" /><div className="lumae-map-line lumae-map-line--c" /><div className="lumae-map-line lumae-map-line--d" />
              <p>Voice <b>→</b> Format <b>→</b> Flow</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lumae-proof-rail" aria-label="Lumae product proof">
        <div><strong>01</strong><span>Voice-aware creation</span></div><div><strong>02</strong><span>Channel-ready systems</span></div><div><strong>03</strong><span>Secure by design</span></div><div><strong>04</strong><span>Ready to publish</span></div>
      </section>

      <section ref={workflowRef} className="lumae-workflow-section">
        <div className="lumae-section-heading"><p className="lumae-eyebrow">A clearer creative operating system</p><h2>From raw thought to<br />reliable momentum.</h2><p>Instead of starting over on every channel, Lumae turns the way you think into a repeatable content signal.</p></div>
        <div className={`lumae-workflow-stack ${workflowVisible ? "is-visible" : ""}`}>
          {[
            { number: "01", icon: ScanLine, title: "Capture the signal", text: "Bring in the idea, audience, and intention behind every piece of content." },
            { number: "02", icon: Workflow, title: "Shape the system", text: "Translate your voice into channel-ready formats without flattening what makes it yours." },
            { number: "03", icon: Layers3, title: "Move with context", text: "Plan, review, and publish from one workspace that keeps the whole story connected." },
          ].map(({ number, icon: Icon, title, text }) => <article key={number} className="lumae-workflow-card"><div className="lumae-workflow-number">{number}</div><Icon className="h-5 w-5" /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="lumae-public-assurance">
        <div className="lumae-assurance-copy"><p className="lumae-eyebrow">Your signal stays yours</p><h2>Creative speed without losing control.</h2><p>Secure sign-in, privacy controls, and export-ready workflows keep your work in your hands while Lumae handles the connective tissue.</p><div className="lumae-assurance-list"><span><ShieldCheck className="h-5 w-5" /> Account security built in</span><span><Orbit className="h-5 w-5" /> Every channel, one source</span><span><Sparkles className="h-5 w-5" /> AI that stays in context</span></div></div>
        <div className="lumae-assurance-art"><div className="lumae-assurance-ring" /><div className="lumae-assurance-ring lumae-assurance-ring--two" /><div className="lumae-assurance-mark">L</div></div>
      </section>

      <section className="lumae-public-close"><p className="lumae-eyebrow">START WITH THE SIGNAL</p><h2>Make the next post feel<br />like it belongs to you.</h2><Button onClick={startFree} className="lumae-signal-button lumae-signal-button--large">{signedIn ? "Open your workspace" : "Start with Lumae"} <ArrowUpRight className="h-4 w-4" /></Button></section>
    </main>
  );
}
