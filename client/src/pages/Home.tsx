import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Calendar, CheckCircle2, LogOut, Rocket, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const LOGO_URL = "/manus-storage/lumae-logo-icon_ccacaad9.jpg";

function LumaeLogo({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const size = compact ? 36 : 44;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {!failed ? (
        <img
          src={LOGO_URL}
          alt="Lumae AI"
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full rounded-xl object-cover ring-1 ring-white/10"
        />
      ) : (
        <div
          role="img"
          aria-label="Lumae AI"
          className="flex h-full w-full items-center justify-center rounded-xl bg-[#141417] text-lg font-semibold text-[#f5f5f7] ring-1 ring-[#26262b]"
        >
          L
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const signedIn = Boolean(isAuthenticated && user);
  const featureSectionRef = useRef<HTMLElement>(null);
  const workflowSectionRef = useRef<HTMLElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [workflowVisible, setWorkflowVisible] = useState(false);

  useEffect(() => {
    const sections = [
      { node: featureSectionRef.current, reveal: setFeaturesVisible },
      { node: workflowSectionRef.current, reveal: setWorkflowVisible },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sections.find(({ node }) => node === entry.target)?.reveal(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    sections.forEach(({ node }) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const startFree = () => {
    if (signedIn) {
      navigate("/content-studio/ai-generator");
      return;
    }
    window.location.href = getLoginUrl();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <main className="landing-motion min-h-dvh overflow-x-hidden bg-[#09090b] text-[#f5f5f7]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{ background: "radial-gradient(70% 42% at 50% 12%, rgba(255,255,255,0.055), transparent 65%)" }}
      />

      <div className="relative">
        <header className="sticky top-0 z-50 border-b border-[#26262b]/80 bg-[#09090b]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5 rounded-xl text-left" aria-label="Lumae AI home">
              <LumaeLogo compact />
              <span className="text-base font-semibold tracking-tight text-[#f5f5f7] sm:text-lg">Lumae AI</span>
            </button>

            <nav className="flex items-center gap-2" aria-label="Primary navigation">
              <Button onClick={() => navigate("/blog")} variant="ghost" size="sm" className="h-9 px-2.5 text-xs text-[#f5f5f7] hover:bg-[#141417] hover:text-white sm:px-4 sm:text-sm">
                Blog
              </Button>
              {signedIn ? (
                <>
                  <Button onClick={() => navigate("/dashboard")} size="sm" className="lumae-gradient-cta h-9 px-3 text-xs sm:px-5 sm:text-sm">
                    Dashboard
                  </Button>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="h-9 border-[#26262b] bg-transparent px-3 text-xs text-[#f5f5f7] hover:bg-[#141417] hover:text-white sm:px-5 sm:text-sm">
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => (window.location.href = getLoginUrl())} variant="ghost" size="sm" className="h-9 px-3 text-xs text-[#f5f5f7] hover:bg-[#141417] hover:text-white sm:px-4 sm:text-sm">
                    Log In
                  </Button>
                  <Button onClick={startFree} size="sm" className="lumae-gradient-cta h-9 px-3 text-xs sm:px-5 sm:text-sm">
                    Sign Up
                  </Button>
                </>
              )}
            </nav>
          </div>
        </header>

        <section className="lumae-landing-hero relative overflow-hidden px-4 pb-14 pt-18 sm:px-6 sm:pb-18 sm:pt-24 lg:pb-20">
          <div aria-hidden="true" className="lumae-landing-noise" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="lumae-hero-enter lumae-hero-delay-0 mb-7 inline-flex items-center gap-2 rounded-full border border-[#26262b] bg-[#141417] px-3 py-1.5 text-xs font-medium text-[#9a9aa2] sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#9a9aa2]" />
              Brand-aware content for every platform · Free to start
            </div>

            <h1 className="lumae-hero-enter lumae-hero-delay-1 mx-auto max-w-4xl tracking-[-0.045em]">
              <span className="block text-4xl font-semibold leading-[1.08] text-[#f5f5f7] sm:text-5xl md:text-6xl lg:text-7xl">
                Match your voice. Optimize every platform.
              </span>
              <span className="mt-2 block bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-5xl font-extrabold leading-[1.03] text-transparent sm:mt-3 sm:text-6xl md:text-7xl lg:text-8xl">
                Lumae AI
              </span>
            </h1>

            <p className="lumae-hero-enter lumae-hero-delay-2 mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[#9a9aa2] sm:text-lg md:text-xl">
              Turn one idea into platform-ready posts, captions, and schedules that preserve your brand voice—without starting from a blank page.
            </p>

            <div className="lumae-hero-enter lumae-hero-delay-3 mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={startFree} className="lumae-landing-cta h-13 w-full rounded-xl px-6 text-base font-semibold sm:w-auto sm:px-8">
                <Rocket className="mr-2 h-4.5 w-4.5" />
                {signedIn ? "Create My Next Post" : "Generate My First Post Free"}
              </Button>
              <Button onClick={() => navigate("/pricing")} variant="outline" className="h-13 w-full rounded-xl border-[#26262b] bg-transparent px-6 text-base font-semibold text-[#f5f5f7] hover:bg-[#141417] hover:text-white sm:w-auto sm:px-8">
                See plans
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </div>

            <div className="lumae-hero-enter lumae-hero-delay-4 mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-[#9a9aa2]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#10b981]" /> 3 free AI generations</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#10b981]" /> No credit card required</span>
            </div>
          </div>
        </section>

        <section ref={featureSectionRef} className="border-y border-[#26262b] bg-[#141417]/55 px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3 md:gap-4">
            {[
              { icon: Wand2, title: "Voice-aware generation", description: "Create content that follows your tone, audience, and goals." },
              { icon: Sparkles, title: "Platform-specific output", description: "Adapt a single brief for Instagram, X, LinkedIn, Facebook, and more." },
              { icon: Calendar, title: "Ready when you are", description: "Review, schedule, and publish through connected social accounts." },
            ].map(({ icon: Icon, title, description }, index) => (
              <article key={title} style={{ transitionDelay: `${index * 90}ms` }} className={`lumae-scroll-reveal rounded-2xl border border-[#26262b] bg-[#09090b] p-5 text-left sm:p-6 ${featuresVisible ? "is-visible" : ""}`}>
                <Icon className="mb-4 h-5 w-5 text-[#9a9aa2]" />
                <h2 className="text-base font-semibold text-[#f5f5f7]">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9a9aa2]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section ref={workflowSectionRef} className="px-4 py-18 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#8b5cf6]">A more useful content workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f5f5f7] sm:text-4xl">From source idea to a stronger publishing system.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-[#9a9aa2]">Lumae gives creators a structured way to generate, adapt, and manage content without losing the voice that makes their work recognisable.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Built around your voice", text: "Use your audience, niche, and style to guide every generation." },
                { icon: Calendar, title: "Plan with confidence", text: "Keep creation and scheduling in one focused workspace." },
              ].map(({ icon: Icon, title, text }, index) => (
                <article key={title} style={{ transitionDelay: `${index * 90}ms` }} className={`lumae-scroll-reveal rounded-2xl border border-[#26262b] bg-[#141417] p-5 sm:p-6 ${workflowVisible ? "is-visible" : ""}`}>
                  <Icon className="h-5 w-5 text-[#06b6d4]" />
                  <h3 className="mt-5 font-semibold text-[#f5f5f7]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#9a9aa2]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
