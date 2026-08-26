import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import "@/lumaeDesignPreview.css";

const EAGLE_VIDEO_URL = "/api/trpc/preview-eagle.mp4";

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
      <section className="lumae-design-preview__media" aria-label="Original eagle-dive motion visual">
        <video
          ref={tallVideoRef}
          className="lumae-design-preview__video lumae-design-preview__video--tall"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={EAGLE_VIDEO_URL} type="video/mp4" />
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
        >
          <source src={EAGLE_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="lumae-design-preview__scrim" aria-hidden="true" />
        <div className="lumae-design-preview__hero">
          <p className="lumae-design-preview__badge">Built for creators who move fast</p>
          <h1><span>Turn Ideas Into Content</span><span>Instantly</span></h1>
        </div>
      </section>

      <section className="lumae-design-preview__pane">
        <button className="lumae-design-preview__back" type="button" onClick={() => navigate("/")}>
          <ArrowLeft aria-hidden="true" /> Back to Lumae
        </button>
        <div className="lumae-design-preview__card">
          <p className="lumae-design-preview__eyebrow">LUMAE ACCESS</p>
          <h2>Welcome Back!</h2>
          <p className="lumae-design-preview__subcopy"><strong>Log in</strong> to keep your content pipeline moving.</p>

          <button type="button" className="lumae-design-preview__primary" onClick={openSecureLogin}>
            Login <ArrowUpRight aria-hidden="true" />
          </button>
          <button type="button" className="lumae-design-preview__secondary" onClick={openSecureLogin}>
            <span className="lumae-design-preview__google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
          <p className="lumae-design-preview__security"><ShieldCheck aria-hidden="true" /> Preview only — existing Lumae sign-in settings remain unchanged.</p>
        </div>
      </section>
    </main>
  );
}
