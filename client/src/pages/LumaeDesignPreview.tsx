import { ArrowLeft, ArrowUpRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import "@/lumaeDesignPreview.css";

const EAGLE_VIDEO_URL = "/api/trpc/preview-eagle.mp4";
const EAGLE_POSTER_URL = "/api/trpc/preview-eagle-poster.png";

export default function LumaeDesignPreview() {
  const [, navigate] = useLocation();
  const tallVideoRef = useRef<HTMLVideoElement>(null);
  const wideVideoRef = useRef<HTMLVideoElement>(null);
  const [isOpeningLogin, setIsOpeningLogin] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    tallVideoRef.current?.pause();
    wideVideoRef.current?.pause();
  }, []);

  const openSecureLogin = () => {
    if (isOpeningLogin) return;
    setIsOpeningLogin(true);
    window.setTimeout(() => navigate("/login"), 160);
  };

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
          poster={EAGLE_POSTER_URL}
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
          poster={EAGLE_POSTER_URL}
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
        <div className="lumae-design-preview__watermark" aria-hidden="true">L</div>
        <button className="lumae-design-preview__back" type="button" onClick={() => navigate("/")}>
          <ArrowLeft aria-hidden="true" /> Back to Lumae
        </button>
        <div className="lumae-design-preview__card">
          <p className="lumae-design-preview__eyebrow">LUMAE ACCESS</p>
          <h2>Welcome Back!</h2>
          <p className="lumae-design-preview__subcopy"><strong>Log in</strong> to keep your content pipeline moving.</p>

          <button type="button" className="lumae-design-preview__primary" onClick={openSecureLogin} disabled={isOpeningLogin} aria-busy={isOpeningLogin}>
            {isOpeningLogin ? <><LoaderCircle className="lumae-design-preview__spinner" aria-hidden="true" /> Opening sign in…</> : <>Login <ArrowUpRight aria-hidden="true" /></>}
          </button>
          <button type="button" className="lumae-design-preview__secondary" onClick={openSecureLogin} disabled={isOpeningLogin}>
            <span className="lumae-design-preview__google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
          <span className="sr-only" aria-live="polite">{isOpeningLogin ? "Opening secure sign in" : ""}</span>
          <p className="lumae-design-preview__security"><ShieldCheck aria-hidden="true" /> Preview only — existing Lumae sign-in settings remain unchanged.</p>
        </div>
      </section>
    </main>
  );
}
