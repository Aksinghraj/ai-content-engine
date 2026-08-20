import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { Download, Globe, Instagram, Linkedin, MapPin, QrCode, Twitter, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "@/lib/trpc";

const socialIcons: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
};

export default function PublicProfile() {
  const [, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";
  const profileQuery = trpc.professionalProfile.publicBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const recordViewMutation = trpc.professionalProfile.recordPublicView.useMutation();
  const profile = profileQuery.data;

  useEffect(() => {
    if (!profile || !slug) return;
    const key = `lumae-public-profile-view:${slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "recorded");
      recordViewMutation.mutate({ slug });
    }
    const setMeta = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(property.startsWith("twitter:") ? "name" : "property", property);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    const title = `${profile.displayName} — ${profile.professionalTitle} | Lumae AI`;
    const description = profile.biography || `${profile.displayName}'s professional profile on Lumae AI.`;
    document.title = title;
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:url", window.location.href);
    setMeta("og:image", profile.avatarUrl || "https://lumae.co.in/manus-storage/lumae-full-logo.jpg");
    setMeta("twitter:card", "summary_large_image");
  }, [profile, recordViewMutation, slug]);

  const downloadQr = () => {
    const svg = document.getElementById("public-profile-qr") as SVGSVGElement | null;
    if (!svg || !profile?.publicSlug) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.publicSlug}-lumae-profile-qr.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (profileQuery.isLoading) {
    return <main className="min-h-screen bg-background px-5 py-20 text-center text-muted-foreground">Loading profile…</main>;
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <section className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <UserRound className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 text-xl font-semibold text-card-foreground">Profile unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">This profile is private or the link is no longer active.</p>
          <Link href="/" className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">Visit Lumae AI</Link>
        </section>
      </main>
    );
  }

  const expertise = (profile.expertise || "").split(",").map((item) => item.trim()).filter(Boolean);
  const links = (profile.socialLinks || {}) as Record<string, string>;

  return (
    <main className="min-h-screen bg-background pb-16">
      <section className="mx-auto max-w-4xl px-5 pt-12 sm:pt-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/5">
          <div className="relative h-44 sm:h-56">
            {profile.coverUrl ? <img src={profile.coverUrl} alt="Profile cover" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_16%_20%,rgb(99_102_241_/_35%),transparent_34%),radial-gradient(circle_at_84%_18%,rgb(6_182_212_/_22%),transparent_30%),linear-gradient(115deg,#18181b,#141417)]" />}
          </div>
          <div className="relative px-6 pb-8 sm:px-10">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-28 w-28 rounded-2xl border-4 border-card object-cover shadow-lg sm:h-32 sm:w-32" /> : <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-card bg-primary text-3xl font-semibold text-primary-foreground shadow-lg sm:h-32 sm:w-32">{profile.displayName.slice(0, 1).toUpperCase()}</div>}
                <div className="pb-1">
                  <h1 className="text-2xl font-semibold text-card-foreground sm:text-3xl">{profile.displayName}</h1>
                  <p className="mt-1 text-sm font-medium text-primary">{profile.professionalTitle}</p>
                </div>
              </div>
              <span className="mb-1 inline-flex w-fit items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">Lumae AI profile</span>
            </div>

            {profile.biography && <p className="mt-7 max-w-2xl leading-relaxed text-muted-foreground">{profile.biography}</p>}
            {expertise.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{expertise.map((item) => <span key={item} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">{item}</span>)}</div>}
            <div className="mt-7 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{profile.location}</span>}
              {profile.availability && <span>{profile.availability}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline"><Globe className="h-4 w-4" />Website</a>}
            </div>
            {Object.entries(links).length > 0 && <div className="mt-6 flex flex-wrap gap-3">{Object.entries(links).map(([name, href]) => { const Icon = socialIcons[name] || Globe; return <a key={name} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-accent"><Icon className="h-4 w-4 text-primary" />{name}</a>; })}</div>}
            <div className="mt-8 flex flex-col items-start gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
              <div className="rounded-xl border border-border bg-background p-2"><QRCodeSVG id="public-profile-qr" value={`${window.location.origin}/u/${profile.publicSlug}`} size={88} bgColor="transparent" fgColor="currentColor" level="M" includeMargin /></div>
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-medium text-card-foreground"><QrCode className="h-4 w-4 text-primary" />Share this profile</p>
                <p className="mt-1 text-sm text-muted-foreground">Download a QR code for your portfolio, event badge, or printed materials.</p>
                <button type="button" onClick={downloadQr} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"><Download className="h-4 w-4" />Download QR code</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
