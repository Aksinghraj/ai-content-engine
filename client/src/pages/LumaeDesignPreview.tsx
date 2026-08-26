import { ArrowLeft, ArrowUpRight, CirclePlay, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import "@/lumaeDesignPreview.css";

const FALCON_VIDEO_URL = "/manus-storage/lumae-falcon-motion_7162a4a1.mp4";
const FALCON_POSTER_URL = "/manus-storage/lumae-falcon-motion-reference_95dbee9e.jpg";

export default function LumaeDesignPreview() {
  const [, navigate] = useLocation();
  const tallVideoRef = useRef<HTMLVideoElement>(null);
  const wideVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    tallVideoRef.current?.pause();
    wideVideoRef.current?.pause();
  }, []);

  const openSecureLogin = () => navigate("/login");

  return (
    <main className="lumae-design-preview" aria-label="Lumae motion design preview">
      <section className="lumae-design-preview__media" aria-label="Original peregrine falcon motion visual">
        <video
          ref={tallVideoRef}
          className="lumae-design-preview__video lumae-design-preview__video--tall"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={FALCON_POSTER_URL}
        >
          <source src={FALCON_VIDEO_URL} type="video/mp4" />
        </video>
        <video
          ref={wideVideoRef}
          className="lumae-design-preview__video lumae-design-preview__video--wide"
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={FALCON_POSTER_URL}
        >
          <source src={FALCON_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="lumae-design-preview__scrim" aria-hidden="true" />
        <div className="lumae-design-preview__hero">
          <p className="lumae-design-preview__badge"><Sparkles aria-hidden="true" /> ORIGINAL LUMAE MOTION</p>
          <h1><span>Signal to action.</span><span>Without the drag.</span></h1>
          <p className="lumae-design-preview__hero-note">An early visual direction for Lumae—built to feel focused, fast, and in control.</p>
        </div>
      </section>

      <section className="lumae-design-preview__pane">
        <button className="lumae-design-preview__back" type="button" onClick={() => navigate("/")}>
          <ArrowLeft aria-hidden="true" /> Back to Lumae
        </button>
        <div className="lumae-design-preview__card">
          <p className="lumae-design-preview__eyebrow">DESIGN PREVIEW</p>
          <h2>Welcome to Lumae.</h2>
          <p className="lumae-design-preview__subcopy"><strong>Secure sign-in</strong> remains available through the existing Lumae email and Google login experience.</p>

          <div className="lumae-design-preview__panel" aria-label="Preview information">
            <span className="lumae-design-preview__panel-icon"><CirclePlay aria-hidden="true" /></span>
            <div><strong>Motion with a purpose</strong><p>The original falcon visual is self-hosted by Lumae and adapts to desktop and mobile layouts.</p></div>
          </div>

          <button type="button" className="lumae-design-preview__primary" onClick={openSecureLogin}>
            Open secure sign-in <ArrowUpRight aria-hidden="true" />
          </button>
          <button type="button" className="lumae-design-preview__secondary" onClick={openSecureLogin}>
            <span className="lumae-design-preview__google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
          <p className="lumae-design-preview__security"><ShieldCheck aria-hidden="true" /> Preview only — your existing sign-in settings are unchanged.</p>
        </div>
      </section>
    </main>
  );
}
