import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
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
  const publicUrl = profile.publicSlug ? `${window.location.origin}/u/${profile.publicSlug}` : "";
  const expertise = useMemo(() => profile.expertise.split(",").map((item) => item.trim()).filter(Boolean), [profile.expertise]);
  const avatarFallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || "Lumae creator")}`;

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
      toast.success(`${kind === "avatar" ? "Profile photo" : "Cover image"} updated.`);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      URL.revokeObjectURL(preview);
    }
  };

  const persist = async () => {
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
        phone: null,
        location: profile.location.trim() || null,
        website: profile.website.trim() || null,
        avatarUrl,
        coverUrl,
        socialLinks: {},
        publicSlug: profile.publicSlug.trim() || null,
        isPublic: profile.isPublic,
        shareSocialLinks: profile.shareSocialLinks,
      });
      await Promise.all([profileQuery.refetch(), activityQuery.refetch()]);
      setEditing(false);
      toast.success("Profile saved securely.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile could not be saved.");
    }
  };

  const copyLink = async () => {
    if (!profile.isPublic || !publicUrl) {
      toast.info("Enable public sharing and choose a profile link first.");
      return;
    }
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Public profile link copied.");
  };

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-6xl space-y-5 pb-10">
        <input ref={avatarInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadImage("avatar", event.target.files?.[0])} />
        <input ref={coverInputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadImage("cover", event.target.files?.[0])} />

        <section className="overflow-hidden rounded-[28px] border border-border bg-card">
          <div className="relative h-44 sm:h-56">
            {coverUrl ? <img src={coverUrl} alt="Profile cover" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_12%_22%,rgb(20_184_166_/_42%),transparent_30%),radial-gradient(circle_at_82%_16%,rgb(99_102_241_/_36%),transparent_28%),linear-gradient(115deg,#0f1720,#111827)]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/15 to-transparent" />
            <Badge className="absolute left-5 top-5 border-white/15 bg-black/25 px-3 py-1.5 text-white backdrop-blur"><LockKeyhole className="mr-1.5 h-3.5 w-3.5" />Private by default</Badge>
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
                  <p className="mt-1 text-sm font-medium text-primary">{profile.professionalTitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={copyLink}><Copy className="mr-2 h-4 w-4" />Copy profile</Button><Button className="lumae-gradient-cta" onClick={() => { setEditing(true); setActiveTab("settings"); }}><PenLine className="mr-2 h-4 w-4" />Edit profile</Button></div>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{profile.bio || "Add a short introduction so your Lumae profile feels like yours."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{user?.emailVerified ? "Email confirmed" : "Email confirmation pending"}</Badge>
              <Badge className="border border-border bg-muted text-card-foreground"><Radio className="mr-1.5 h-3.5 w-3.5 text-primary" />{profile.profileStatus}</Badge>
              <Badge className="border border-border bg-muted text-card-foreground"><UsersRound className="mr-1.5 h-3.5 w-3.5 text-primary" />{profile.collaborationOpen ? "Open to collaborate" : "Collaboration private"}</Badge>
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
              <Card className="p-5"><p className="text-sm font-semibold text-card-foreground">Profile sharing</p><p className="mt-2 text-sm text-muted-foreground">{profile.isPublic && publicUrl ? "Your public profile is available at this link." : "Your profile is private. Turn on sharing only when you are ready."}</p><div className="mt-4 rounded-lg border border-border bg-muted/35 p-3 text-xs text-muted-foreground">{publicUrl || "Create a public link in Settings."}</div><Button className="mt-4 w-full" variant="outline" onClick={() => { setEditing(true); setActiveTab("settings"); }}><ShieldCheck className="mr-2 h-4 w-4" />Manage privacy</Button></Card>
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
            </div><div className="mt-5 grid gap-3 rounded-xl border border-border bg-muted/30 p-4"><label className="flex items-center justify-between gap-4 text-sm text-card-foreground"><span><strong>Open to collaborate</strong><small className="mt-1 block text-muted-foreground">Shows a collaboration pill on your public profile.</small></span><input type="checkbox" checked={profile.collaborationOpen} onChange={(event) => setProfile((current) => ({ ...current, collaborationOpen: event.target.checked }))} className="h-4 w-4 accent-primary" /></label><label className="flex items-center justify-between gap-4 text-sm text-card-foreground"><span><strong>Make profile public</strong><small className="mt-1 block text-muted-foreground">Requires a public link. Only intentional profile details are shared.</small></span><input type="checkbox" checked={profile.isPublic} onChange={(event) => setProfile((current) => ({ ...current, isPublic: event.target.checked }))} className="h-4 w-4 accent-primary" /></label></div><div className="mt-5 flex flex-wrap gap-2"><Button className="lumae-gradient-cta" onClick={persist} disabled={saveProfile.isPending}><Save className="mr-2 h-4 w-4" />Save profile</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div></Card> : <Card className="p-5"><h2 className="text-lg font-semibold text-card-foreground">Profile settings</h2><p className="mt-1 text-sm text-muted-foreground">Update your identity, public sharing, and collaboration preferences.</p><Button className="mt-5" onClick={() => setEditing(true)}><Settings2 className="mr-2 h-4 w-4" />Edit settings</Button></Card>}
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
