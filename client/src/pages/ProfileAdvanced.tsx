import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { COVER_PRESETS, getCoverPreset, PROFILE_THEMES, type CoverPresetId, type ProfileThemeId } from "@/lib/profileAppearance";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";
import {
  Activity, BadgeCheck, Bookmark, BriefcaseBusiness, CalendarClock, Camera, CheckCircle2,
  CircleUserRound, Copy, Eye, Globe, ImagePlus, Layers3, Link2, LockKeyhole, MapPin,
  PenLine, Pin, Plus, Radio, Save, Settings2, ShieldCheck, Sparkles, UserRound, UsersRound,
  WandSparkles, X,
} from "lucide-react";

type ProfileForm = {
  name: string;
  username: string;
  professionalTitle: string;
  bio: string;
  expertise: string;
  availability: string;
  profileStatus: string;
  collaborationOpen: boolean;
  profileTheme: ProfileThemeId;
  coverPreset: CoverPresetId;
  location: string;
  website: string;
  publicSlug: string;
  isPublic: boolean;
  shareSocialLinks: boolean;
};

const blankProfile: ProfileForm = {
  name: "Lumae creator",
  username: "",
  professionalTitle: "Content Strategist & AI Workflow Builder",
  bio: "",
  expertise: "",
  availability: "Open to collaborations",
  profileStatus: "Building with Lumae",
  collaborationOpen: false,
  profileTheme: "signal",
  coverPreset: "aurora",
  location: "",
  website: "",
  publicSlug: "",
  isPublic: false,
  shareSocialLinks: false,
};

const profileTabs = [
  ["overview", "Profile info", CircleUserRound],
  ["activity", "Activity", Activity],
  ["highlights", "Highlights", Sparkles],
  ["posts", "Posts", Layers3],
  ["saved", "Saved", Bookmark],
  ["settings", "Settings", Settings2],
] as const;

export default function ProfileAdvanced() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const profileQuery = trpc.professionalProfile.mine.useQuery();
  const activityQuery = trpc.professionalProfile.activity.useQuery();
  const viewQuery = trpc.professionalProfile.viewSummary.useQuery();
  const saveProfile = trpc.professionalProfile.save.useMutation();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<(typeof profileTabs)[number][0]>("overview");
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileForm>(blankProfile);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const stored = profileQuery.data;
    if (!stored) return;
    setProfile({
      name: stored.displayName || user?.name || blankProfile.name,
      username: stored.username || "",
      professionalTitle: stored.professionalTitle || blankProfile.professionalTitle,
      bio: stored.biography || "",
      expertise: stored.expertise || "",
      availability: stored.availability || blankProfile.availability,
      profileStatus: stored.profileStatus || blankProfile.profileStatus,
      collaborationOpen: stored.collaborationOpen || false,
      profileTheme: (stored.profileTheme as ProfileThemeId) || blankProfile.profileTheme,
      coverPreset: (stored.coverPreset as CoverPresetId) || blankProfile.coverPreset,
      location: stored.location || "",
      website: stored.website || "",
      publicSlug: stored.publicSlug || "",
      isPublic: stored.isPublic,
      shareSocialLinks: stored.shareSocialLinks,
    });
    setAvatarUrl(stored.avatarUrl || null);
    setCoverUrl(stored.coverUrl || null);
  }, [profileQuery.data, user?.name]);

  const activity = activityQuery.data;
  const publicUrl = profile.publicSlug.trim() ? `${window.location.origin}/u/${encodeURIComponent(profile.publicSlug.trim())}` : "";
  const expertise = useMemo(() => profile.expertise.split(",").map((item) => item.trim()).filter(Boolean), [profile.expertise]);
  const avatarFallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || "Lumae creator")}`;
  const coverPreset = getCoverPreset(profile.coverPreset);
  const derivePublicSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
  const getShareSlug = () => derivePublicSlug(profile.publicSlug || profile.username || profile.name);

  const uploadImage = async (kind: "avatar" | "cover", file?: File) => {
    if (!file) return;
    const maxBytes = kind === "cover" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > maxBytes) {
      toast.error(`Choose a PNG, JPEG, or WebP image below ${kind === "cover" ? "10" : "5"} MB.`);
      return;
    }
    const preview = URL.createObjectURL(file);
    kind === "avatar" ? setAvatarUrl(preview) : setCoverUrl(preview);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`/api/profile/upload-${kind}`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      kind === "avatar" ? setAvatarUrl(result.url) : setCoverUrl(result.url);
      await profileQuery.refetch();
      toast.success(`${kind === "avatar" ? "Profile photo" : "Cover image"} updated and saved.`);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      URL.revokeObjectURL(preview);
    }
  };

  const persist = async () => {
    const publicSlug = getShareSlug();
    if (profile.isPublic && publicSlug.length < 3) {
      toast.error("Add a username or display name with at least 3 letters before enabling public sharing.");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        displayName: profile.name.trim() || "Lumae creator",
        username: profile.username.trim() || null,
        professionalTitle: profile.professionalTitle.trim() || blankProfile.professionalTitle,
        biography: profile.bio.trim() || null,
        expertise: profile.expertise.trim() || null,
        availability: profile.availability.trim() || null,
        profileStatus: profile.profileStatus.trim() || null,
        collaborationOpen: profile.collaborationOpen,
        profileTheme: profile.profileTheme,
        coverPreset: profile.coverPreset,
        phone: null,
        location: profile.location.trim() || null,
        website: profile.website.trim() || null,
        avatarUrl,
        coverUrl,
        socialLinks: {},
        publicSlug: publicSlug || null,
        isPublic: profile.isPublic,
        shareSocialLinks: profile.shareSocialLinks,
      });
      setProfile((current) => ({ ...current, publicSlug }));
      await Promise.all([profileQuery.refetch(), activityQuery.refetch()]);
      setEditing(false);
      toast.success("Profile saved securely.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile could not be saved.");
    }
  };

  const toggleVisibility = async () => {
    const nextIsPublic = !profile.isPublic;
    const publicSlug = getShareSlug();
    if (nextIsPublic && publicSlug.length < 3) {
      toast.info("Add a username or display name first so Lumae can create your share link.");
      setEditing(true);
      setActiveTab("settings");
      return;
    }
    const nextProfile = { ...profile, isPublic: nextIsPublic, publicSlug };
    setProfile(nextProfile);
    try {
      await saveProfile.mutateAsync({
        displayName: nextProfile.name.trim() || "Lumae creator",
        username: nextProfile.username.trim() || null,
        professionalTitle: nextProfile.professionalTitle.trim() || blankProfile.professionalTitle,
        biography: nextProfile.bio.trim() || null,
        expertise: nextProfile.expertise.trim() || null,
        availability: nextProfile.availability.trim() || null,
        profileStatus: nextProfile.profileStatus.trim() || null,
        collaborationOpen: nextProfile.collaborationOpen,
        profileTheme: nextProfile.profileTheme,
        coverPreset: nextProfile.coverPreset,
        phone: null,
        location: nextProfile.location.trim() || null,
        website: nextProfile.website.trim() || null,
        avatarUrl,
        coverUrl,
        socialLinks: {},
        publicSlug: publicSlug || null,
        isPublic: nextIsPublic,
        shareSocialLinks: nextProfile.shareSocialLinks,
      });
      await profileQuery.refetch();
      toast.success(nextIsPublic ? "Profile is now public. Your share link is ready." : "Profile is private. Your public link is disabled.");
    } catch (error) {
      setProfile(profile);
      toast.error(error instanceof Error ? error.message : "Profile visibility could not be updated.");
    }
  };

  const copyLink = async () => {
    if (!profile.isPublic || !publicUrl) {
      toast.info("Enable public sharing and choose a profile link first.");
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = publicUrl;
        input.setAttribute("readonly", "true");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
        document.body.removeChild(input);
      }
      toast.success("Public profile link copied.");
    } catch {
      toast.error("The link could not be copied. Please select and copy it manually.");
    }
  };

  const shareLink = () => {
    if (!profile.isPublic || !publicUrl) {
      toast.info("Enable public sharing and choose a profile link first.");
      return;
    }
    setShareOpen(true);
  };
  const shareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.name} · Lumae AI`, text: `View ${profile.name}'s public Lumae profile`, url: publicUrl });
        toast.success("Profile shared.");
      } else {
        await copyLink();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("The profile could not be shared. Please copy the link instead.");
    }
  };

  return (
    <DashboardLayout>
      <main data-profile-theme={profile.profileTheme} className="mx-auto w-full max-w-6xl space-y-5 pb-10">
        <input ref={avatarInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadImage("avatar", event.target.files?.[0])} />
        <input ref={coverInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadImage("cover", event.target.files?.[0])} />

        <section className="overflow-hidden rounded-[28px] border border-border bg-card">
          <div className="relative h-44 sm:h-56">
            {coverUrl ? <img src={coverUrl} alt="Profile cover" className="h-full w-full object-cover" /> : <div className={`h-full w-full ${coverPreset.className}`} />}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/15 to-transparent" />
            <Button type="button" size="sm" variant="outline" aria-pressed={profile.isPublic} className="absolute left-5 top-5 border-white/20 bg-black/30 text-white hover:bg-black/50" onClick={toggleVisibility} disabled={saveProfile.isPending}><LockKeyhole className="mr-1.5 h-3.5 w-3.5" />Profile visibility: {profile.isPublic ? "Public" : "Private"}</Button>
            <Button size="sm" variant="outline" className="absolute right-5 top-5 border-white/20 bg-black/30 text-white hover:bg-black/50" onClick={() => coverInputRef.current?.click()}><ImagePlus className="mr-2 h-4 w-4" />Cover</Button>
          </div>
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 md:flex-row md:items-end md:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <button type="button" className="group relative shrink-0" onClick={() => avatarInputRef.current?.click()} aria-label="Change profile photo">
                  <img src={avatarUrl || avatarFallback} alt="Profile" className="h-28 w-28 rounded-[26px] border-4 border-card object-cover shadow-xl sm:h-32 sm:w-32" />
                  <span className="absolute inset-0 flex items-center justify-center rounded-[26px] bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/45 group-hover:opacity-100"><Camera className="h-5 w-5" /></span>
                </button>
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">{profile.name}</h1><BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified Lumae account" /></div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{profile.username ? `@${profile.username}` : "Choose your creator handle"}</p>
                  <p className="profile-identity-accent mt-1 text-sm font-medium">{profile.professionalTitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={shareLink} disabled={!profile.isPublic || !publicUrl}><Link2 className="mr-2 h-4 w-4" />Share profile</Button><Button className="lumae-gradient-cta" onClick={() => { setEditing(true); setActiveTab("settings"); }}><PenLine className="mr-2 h-4 w-4" />Edit profile</Button></div>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{profile.bio || "Add a short introduction so your Lumae profile feels like yours."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{user?.emailVerified ? "Email confirmed" : "Email confirmation pending"}</Badge>
              <Badge className="border border-border bg-muted text-card-foreground"><Radio className="profile-identity-accent mr-1.5 h-3.5 w-3.5" />{profile.profileStatus}</Badge>
              <Badge className="border border-border bg-muted text-card-foreground"><UsersRound className="profile-identity-accent mr-1.5 h-3.5 w-3.5" />{profile.collaborationOpen ? "Open to collaborate" : "Collaboration private"}</Badge>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            ["Generated", activity?.generatedContent ?? 0, WandSparkles],
            ["Scheduled", activity?.scheduledPosts ?? 0, CalendarClock],
            ["Connected", activity?.connectedAccounts ?? 0, Link2],
            ["Profile views", viewQuery.data?.totalViews ?? 0, Eye],
          ] as Array<[string, number, LucideIcon]>).map(([label, value, Icon]) => <Card key={label} className="p-4"><Icon className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold text-card-foreground">{value}</p></Card>)}
        </section>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 border border-border bg-muted/45 p-1 sm:grid-cols-6">
            {profileTabs.map(([value, label, Icon]) => <TabsTrigger key={value} value={value} className="min-h-10 gap-1.5 text-xs sm:text-sm"><Icon className="h-3.5 w-3.5" /><span className="hidden md:inline">{label}</span></TabsTrigger>)}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <section className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
              <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Creator profile</p><h2 className="mt-2 text-xl font-semibold text-card-foreground">{profile.professionalTitle}</h2><div className="mt-4 flex flex-wrap gap-2">{expertise.length ? expertise.map((item) => <Badge key={item} className="border border-primary/20 bg-primary/10 text-primary">{item}</Badge>) : <span className="text-sm text-muted-foreground">Add your focus areas in Settings.</span>}</div><div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">{profile.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{profile.location}</span>}{profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline"><Globe className="h-4 w-4" />Website</a>}</div></Card>
              <Card className="p-5"><p className="text-sm font-semibold text-card-foreground">Profile sharing</p><p className="mt-2 text-sm text-muted-foreground">{profile.isPublic && publicUrl ? "Your public profile is available at this link." : "Your profile is private. Turn on sharing only when you are ready."}</p><div className="mt-4 break-all rounded-lg border border-border bg-muted/35 p-3 text-xs text-muted-foreground">{profile.isPublic && publicUrl ? publicUrl : "Create a public link in Settings, then enable Public profile."}</div><p className="mt-4 text-xs text-muted-foreground">Use the Share profile button above to copy the link, share it, or show its QR code.</p><Button className="mt-3 w-full" variant="outline" onClick={() => { setEditing(true); setActiveTab("settings"); }}><ShieldCheck className="mr-2 h-4 w-4" />Manage privacy</Button></Card>
            </section>
          </TabsContent>

          <TabsContent value="activity"><Card className="p-5"><h2 className="text-lg font-semibold text-card-foreground">Private Lumae activity</h2><p className="mt-1 text-sm text-muted-foreground">Only you can see this activity.</p><div className="mt-5 space-y-3">{activity?.recentActivity.length ? activity.recentActivity.map((item) => <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border p-3"><WandSparkles className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-sm font-medium text-card-foreground">Generated {item.goal} content for {item.platform}</p><p className="mt-1 text-xs text-muted-foreground">{item.niche} · {new Date(item.createdAt).toLocaleString()}</p></div></div>) : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Your completed content work will appear here.</p>}</div></Card></TabsContent>
          <TabsContent value="highlights"><Card className="p-5"><h2 className="text-lg font-semibold text-card-foreground">Highlights</h2><p className="mt-1 text-sm text-muted-foreground">Showcase your strongest Lumae work here in a future update. No content is published automatically.</p><Button className="mt-5" variant="outline" onClick={() => navigate("/content-studio/ai-generator")}><Plus className="mr-2 h-4 w-4" />Create content</Button></Card></TabsContent>
          <TabsContent value="posts"><Card className="p-5"><h2 className="text-lg font-semibold text-card-foreground">Posts & videos</h2><p className="mt-1 text-sm text-muted-foreground">Published social posts stay private to their connected accounts. Review scheduling in the Scheduling workspace.</p><Button className="mt-5" variant="outline" onClick={() => navigate("/scheduling/post-scheduling")}><CalendarClock className="mr-2 h-4 w-4" />Open scheduling</Button></Card></TabsContent>
          <TabsContent value="saved"><Card className="p-5"><h2 className="text-lg font-semibold text-card-foreground">Saved</h2><p className="mt-1 text-sm text-muted-foreground">Saved ideas and private drafts remain visible only to you.</p></Card></TabsContent>
          <TabsContent value="settings" className="space-y-4">
            {editing ? <Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-card-foreground">Edit profile</h2><p className="mt-1 text-sm text-muted-foreground">Your email, credits, and connected-account details are never part of your public profile.</p></div><Button size="icon" variant="ghost" onClick={() => setEditing(false)} aria-label="Close profile editor"><X className="h-4 w-4" /></Button></div><div className="mt-6 grid gap-4 md:grid-cols-2">
              {[["Display name", "name", "Your name"], ["Username", "username", "creator.handle"], ["Professional title", "professionalTitle", "Content strategist"], ["Profile status", "profileStatus", "Building with Lumae"], ["Location", "location", "City, country"], ["Website", "website", "https://example.com"], ["Public link", "publicSlug", "your-name"]].map(([label, key, placeholder]) => <label key={key} className="grid gap-1.5 text-sm font-medium text-card-foreground"><span>{label}</span><input value={profile[key as keyof ProfileForm] as string} placeholder={placeholder} onChange={(event) => setProfile((current) => ({ ...current, [key]: key === "username" ? event.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") : key === "publicSlug" ? event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") : event.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-primary focus:ring-2" /></label>)}
              <label className="grid gap-1.5 text-sm font-medium text-card-foreground md:col-span-2"><span>Bio</span><textarea value={profile.bio} rows={4} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-primary focus:ring-2" /></label>
              <label className="grid gap-1.5 text-sm font-medium text-card-foreground md:col-span-2"><span>Focus areas</span><input value={profile.expertise} placeholder="Content strategy, video, creator education" onChange={(event) => setProfile((current) => ({ ...current, expertise: event.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none ring-primary focus:ring-2" /></label>
            </div><div className="mt-5 grid gap-4 rounded-xl border border-border bg-muted/30 p-4"><div><p className="text-sm font-semibold text-card-foreground">Profile theme</p><p className="mt-1 text-xs text-muted-foreground">Applies to your private editor and public profile when shared.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{PROFILE_THEMES.map((theme) => <button key={theme.id} type="button" onClick={() => setProfile((current) => ({ ...current, profileTheme: theme.id }))} className={`flex items-center gap-3 rounded-lg border p-3 text-left ${profile.profileTheme === theme.id ? "border-primary bg-primary/10" : "border-border bg-background"}`}><span className={`h-4 w-4 rounded-full ${theme.dotClass}`} /><span><span className="block text-sm font-medium text-card-foreground">{theme.label}</span><span className="block text-xs text-muted-foreground">{theme.description}</span></span></button>)}</div></div><div><p className="text-sm font-semibold text-card-foreground">Cover preset</p><p className="mt-1 text-xs text-muted-foreground">Choose a visual background or keep your uploaded cover image.</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{COVER_PRESETS.map((preset) => <button key={preset.id} type="button" onClick={() => setProfile((current) => ({ ...current, coverPreset: preset.id }))} className={`overflow-hidden rounded-lg border text-left ${profile.coverPreset === preset.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}><span className={`block h-12 ${preset.className}`} /><span className="block px-2 py-1.5 text-xs font-medium text-card-foreground">{preset.label}</span></button>)}</div></div></div><div className="mt-5 grid gap-3 rounded-xl border border-border bg-muted/30 p-4"><label className="flex items-center justify-between gap-4 text-sm text-card-foreground"><span><strong>Open to collaborate</strong><small className="mt-1 block text-muted-foreground">Shows a collaboration pill on your public profile.</small></span><input type="checkbox" checked={profile.collaborationOpen} onChange={(event) => setProfile((current) => ({ ...current, collaborationOpen: event.target.checked }))} className="h-4 w-4 accent-primary" /></label><label className="flex items-center justify-between gap-4 text-sm text-card-foreground"><span><strong>Make profile public</strong><small className="mt-1 block text-muted-foreground">Requires a public link. Only intentional profile details are shared.</small></span><input type="checkbox" checked={profile.isPublic} onChange={(event) => setProfile((current) => ({ ...current, isPublic: event.target.checked }))} className="h-4 w-4 accent-primary" /></label></div><div className="mt-5 flex flex-wrap gap-2"><Button className="lumae-gradient-cta" onClick={persist} disabled={saveProfile.isPending}><Save className="mr-2 h-4 w-4" />Save profile</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div></Card> : <Card className="p-5"><h2 className="text-lg font-semibold text-card-foreground">Profile settings</h2><p className="mt-1 text-sm text-muted-foreground">Update your identity, public sharing, and collaboration preferences.</p><Button className="mt-5" onClick={() => setEditing(true)}><Settings2 className="mr-2 h-4 w-4" />Edit settings</Button></Card>}
          </TabsContent>
        </Tabs>
      </main>
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your Lumae profile</DialogTitle>
            <DialogDescription>Share one secure public link or let someone scan the QR code.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-3">
            {publicUrl ? <QRCodeSVG value={publicUrl} size={192} includeMargin className="rounded-lg bg-white p-3" aria-label={`QR code for ${profile.name}'s public profile`} /> : null}
            <p className="w-full break-all rounded-lg border border-border bg-muted/35 p-3 text-center text-xs text-muted-foreground">{publicUrl || "Enable public sharing to create a link."}</p>
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button type="button" variant="outline" onClick={copyLink} disabled={!publicUrl || !profile.isPublic}><Copy className="mr-2 h-4 w-4" />Copy link</Button>
            <Button type="button" className="lumae-gradient-cta" onClick={shareNative} disabled={!publicUrl || !profile.isPublic}><Link2 className="mr-2 h-4 w-4" />Share link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
