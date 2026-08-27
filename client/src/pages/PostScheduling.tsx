import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, CheckCircle2, Clock3, ImagePlus, Loader2, Sparkles, Trash2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LumaeLightPulse } from "@/components/LumaeLightPulse";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", maxChars: 2200, requirement: "An image or video is required." },
  { id: "facebook", label: "Facebook", icon: "👥", maxChars: 5000, requirement: "Text posts are supported." },
  { id: "twitter", label: "Twitter / X", icon: "𝕏", maxChars: 280, requirement: "Scheduling is unavailable until an API budget is approved." },
  { id: "linkedin", label: "LinkedIn", icon: "💼", maxChars: 3000, requirement: "Text-only posts are supported." },
  { id: "youtube", label: "YouTube", icon: "📺", maxChars: 5000, requirement: "A managed video is required; uploads are private." },
  { id: "tiktok", label: "TikTok", icon: "🎵", maxChars: 2200, requirement: "A managed video is required." },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];
type UploadedMedia = { url: string; key: string; mediaType: "image" | "video"; filename: string; previewUrl: string };

function defaultDateTime() {
  const later = new Date(Date.now() + 60 * 60 * 1000);
  return new Date(later.getTime() - later.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function PostScheduling() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("compose");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "humorous" | "inspirational" | "educational">("professional");
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const [scheduledAt, setScheduledAt] = useState(defaultDateTime);
  const [media, setMedia] = useState<UploadedMedia | null>(null);

  const utils = trpc.useUtils();
  const accounts = trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();
  const scheduled = trpc.socialMedia.getScheduledPosts.useQuery();
  const upload = trpc.socialMedia.uploadMedia.useMutation();
  const createSchedule = trpc.socialMedia.schedulePost.useMutation();
  const removeSchedule = trpc.socialMedia.deletePost.useMutation();
  const generate = trpc.aiPostGeneration.generateForPlatform.useMutation();
  const connections = accounts.data ?? [];
  const posts = scheduled.data ?? [];
  const accountByPlatform = useMemo(() => new Map(connections.map((item) => [item.platform, item])), [connections]);
  const isReady = (platform: PlatformId) => {
    const account = accountByPlatform.get(platform);
    return Boolean(account?.isValidated && account.autoPost && (!account.tokenExpiresAt || new Date(account.tokenExpiresAt).getTime() > Date.now()));
  };
  const selectedInfo = PLATFORMS.filter((item) => platforms.includes(item.id));
  const limit = selectedInfo.length ? Math.min(...selectedInfo.map((item) => item.maxChars)) : 5000;
  const counts = useMemo(() => ({
    pending: posts.filter((item) => item.status === "pending" || item.status === "processing").length,
    published: posts.filter((item) => item.status === "published").length,
    failed: posts.filter((item) => item.status === "failed").length,
  }), [posts]);

  const clear = () => {
    if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl);
    setContent("");
    setPlatforms([]);
    setMedia(null);
    setScheduledAt(defaultDateTime());
  };

  const togglePlatform = (platform: PlatformId) => {
    if (!isReady(platform)) {
      toast.error(`Connect, validate, and enable Auto-Post for ${PLATFORMS.find((item) => item.id === platform)?.label} before scheduling.`);
      return;
    }
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  };

  const uploadMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return toast.error("Choose an image or video file.");
    if (file.size > 650 * 1024) return toast.error("This file is larger than the current managed-media limit of 650 KB.");
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error("The selected file could not be read."));
        reader.readAsDataURL(file);
      });
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const saved = await upload.mutateAsync({ filename: file.name, fileData, mediaType });
      if (media?.previewUrl) URL.revokeObjectURL(media.previewUrl);
      setMedia({ url: saved.url, key: saved.key, mediaType: saved.mediaType, filename: saved.filename, previewUrl: URL.createObjectURL(file) });
      toast.success("Media uploaded securely and ready to attach.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media upload failed.");
    }
  };

  const createGeneratedContent = async () => {
    if (!topic.trim()) return toast.error("Enter a topic before generating content.");
    const platform = platforms[0] ?? "instagram";
    try {
      const result = await generate.mutateAsync({ topic, platform, tone, includeHashtags: true, includeEmoji: platform !== "linkedin" });
      setContent(result.content);
      if (!platforms.length) setPlatforms([platform]);
      setTab("compose");
      toast.success("Your editable AI draft is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Content generation failed.");
    }
  };

  const schedulePost = async () => {
    if (!content.trim()) return toast.error("Write or generate content before scheduling.");
    if (!platforms.length) return toast.error("Select at least one ready account.");
    if (content.length > limit) return toast.error(`Shorten this post to ${limit.toLocaleString()} characters for the selected accounts.`);
    const time = new Date(scheduledAt);
    if (Number.isNaN(time.getTime()) || time.getTime() <= Date.now()) return toast.error("Choose a future date and time.");
    if (platforms.includes("instagram") && !media) return toast.error("Instagram requires a managed image or video.");
    if (platforms.includes("youtube") && media?.mediaType !== "video") return toast.error("YouTube requires a managed video.");
    if (platforms.includes("linkedin") && media) return toast.error("LinkedIn supports text-only publishing at this time. Schedule it separately without media.");

    const results = await Promise.allSettled(platforms.map((platform) => {
      const connection = accountByPlatform.get(platform);
      if (!connection) throw new Error(`No ${platform} connection found.`);
      return createSchedule.mutateAsync({ socialConnectionId: connection.id, platform, content, scheduledAt: time, mediaUrl: media?.url, mediaType: media?.mediaType, mediaKey: media?.key });
    }));
    const failed = results.filter((result) => result.status === "rejected");
    await utils.socialMedia.getScheduledPosts.invalidate();
    if (failed.length) return toast.error(`${failed.length} post${failed.length === 1 ? " was" : "s were"} not scheduled. Review account readiness and media requirements.`);
    toast.success(`Scheduled for ${platforms.length} platform${platforms.length === 1 ? "" : "s"}.`);
    clear();
    setTab("scheduled");
  };

  const deletePost = async (postId: number) => {
    try {
      await removeSchedule.mutateAsync({ postId });
      await utils.socialMedia.getScheduledPosts.invalidate();
      toast.success("Scheduled post removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove this post.");
    }
  };

  return <DashboardLayout><main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
    <header className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Scheduling</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Post scheduling</h1><p className="max-w-3xl text-sm leading-6 text-muted-foreground">Schedule posts only for connected, validated accounts with Auto-Post enabled. Lumae shows the real publishing status after the selected time.</p></header>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Scheduling activity">{([
      { label: "Awaiting publish", value: counts.pending, Icon: Clock3, color: "text-amber-500" },
      { label: "Published", value: counts.published, Icon: CheckCircle2, color: "text-emerald-500" },
      { label: "Needs attention", value: counts.failed, Icon: AlertCircle, color: "text-rose-500" },
    ]).map(({ label, value, Icon, color }) => <Card key={label} className="border-border bg-card text-card-foreground"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div><Icon className={`h-5 w-5 ${color}`} /></CardContent></Card>)}</section>
    <Tabs value={tab} onValueChange={setTab} className="space-y-5"><TabsList className="grid h-auto w-full grid-cols-3 bg-muted p-1"><TabsTrigger value="compose" className="min-h-10 px-2 text-xs sm:text-sm">Compose</TabsTrigger><TabsTrigger value="generate" className="min-h-10 px-2 text-xs sm:text-sm">AI generate</TabsTrigger><TabsTrigger value="scheduled" className="min-h-10 px-2 text-xs sm:text-sm">Scheduled</TabsTrigger></TabsList>
      <TabsContent value="compose" className="mt-0"><div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"><Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-3"><CardTitle className="text-lg">Create a scheduled post</CardTitle><CardDescription>Use real connection status and managed media rather than placeholder accounts or activity.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="content">Post content</Label><Textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a post or use the AI generate tab." className="min-h-40 resize-y bg-background" /><p className={`text-right text-xs ${content.length > limit ? "text-destructive" : "text-muted-foreground"}`}>{content.length.toLocaleString()} / {limit.toLocaleString()} characters</p></div><div className="space-y-2"><Label htmlFor="when">Publish time</Label><Input id="when" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="max-w-sm bg-background" /></div><div className="space-y-2"><Label>Managed media <span className="font-normal text-muted-foreground">(one file, up to 650 KB)</span></Label>{media ? <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 p-3"><span className="rounded bg-background px-2 py-1 text-xs">{media.mediaType}</span><span className="min-w-0 flex-1 truncate text-sm">{media.filename}</span><Button size="sm" type="button" variant="ghost" onClick={() => { URL.revokeObjectURL(media.previewUrl); setMedia(null); }}><XCircle className="mr-1 h-4 w-4" />Remove</Button></div> : <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 text-center hover:bg-muted/60"><>{upload.isPending ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <UploadCloud className="h-5 w-5 text-muted-foreground" />}</><span className="mt-2 text-sm font-medium">Upload image or video</span><span className="mt-1 text-xs text-muted-foreground">JPEG, PNG, GIF, WebP, MP4, WebM, or MOV</span><input className="sr-only" type="file" accept="image/*,video/*" onChange={uploadMedia} disabled={upload.isPending} /></label>}</div><div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={clear}>Clear</Button><Button type="button" onClick={schedulePost} disabled={createSchedule.isPending || !content.trim() || !platforms.length || content.length > limit} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90">{createSchedule.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}Schedule post</Button></div></CardContent></Card>
        <aside className="space-y-4"><Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-3"><CardTitle className="text-base">Choose accounts</CardTitle><CardDescription className="text-xs">Read directly from your secure account connections.</CardDescription></CardHeader><CardContent className="space-y-2">{accounts.isLoading ? <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading accounts</div> : PLATFORMS.map((platform) => { const connection = accountByPlatform.get(platform.id); const ready = isReady(platform.id); const selected = platforms.includes(platform.id); return <button key={platform.id} type="button" onClick={() => togglePlatform(platform.id)} aria-pressed={selected} className={`w-full rounded-md border p-3 text-left ${selected ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"}`}><span className="flex items-start gap-2"><span className="text-lg">{platform.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{platform.label}</span><Badge variant="outline" className={ready ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>{ready ? "Ready" : connection?.isValidated ? "Enable Auto-Post" : "Not ready"}</Badge></span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{ready && connection?.username ? `@${connection.username}` : platform.requirement}</span></span></span></button>; })}{!PLATFORMS.some((platform) => isReady(platform.id)) && <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => navigate("/scheduling/connected-accounts")}>Open connected accounts</Button>}</CardContent></Card><Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-base">Publishing requirements</CardTitle></CardHeader><CardContent className="space-y-2 text-xs leading-5 text-muted-foreground"><p><strong className="text-foreground">Instagram:</strong> one managed image or video.</p><p><strong className="text-foreground">YouTube:</strong> one managed video, uploaded privately.</p><p><strong className="text-foreground">LinkedIn:</strong> text-only until asset upload support is added.</p></CardContent></Card></aside></div></TabsContent>
      <TabsContent value="generate" className="mt-0"><Card className="border-border bg-card text-card-foreground"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-primary" />Generate a starting draft</CardTitle><CardDescription>AI creates editable copy only; it never publishes or schedules automatically.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]"><div className="space-y-2"><Label htmlFor="topic">Topic</Label><Input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="For example: product launch for busy creators" className="bg-background" /></div><div className="space-y-2"><Label htmlFor="tone">Tone</Label><select id="tone" value={tone} onChange={(event) => setTone(event.target.value as typeof tone)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="professional">Professional</option><option value="casual">Casual</option><option value="humorous">Humorous</option><option value="inspirational">Inspirational</option><option value="educational">Educational</option></select></div></div><Button type="button" onClick={createGeneratedContent} disabled={generate.isPending || !topic.trim()} className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90">{generate.isPending ? <><LumaeLightPulse state="working" size={18} className="mr-2" label="Lumae is generating your draft" />Generating content</> : <><Sparkles className="mr-2 h-4 w-4" />Generate content</>}</Button></CardContent></Card></TabsContent>
      <TabsContent value="scheduled" className="mt-0 space-y-4">{scheduled.isLoading ? <Card className="border-border bg-card p-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /><p className="mt-2 text-sm">Loading scheduled posts</p></Card> : !posts.length ? <Card className="border-border bg-card p-8 text-center"><ImagePlus className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-medium">No scheduled posts</p><p className="mt-1 text-sm text-muted-foreground">Posts saved here reflect your actual account and publishing status.</p><Button className="mt-4" variant="outline" onClick={() => setTab("compose")}>Create a post</Button></Card> : posts.map((post) => <Card key={post.id} className="border-border bg-card text-card-foreground"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 space-y-2"><div className="flex flex-wrap gap-2"><Badge variant="outline">{PLATFORMS.find((platform) => platform.id === post.platform)?.label ?? post.platform}</Badge><Badge className={post.status === "published" ? "bg-emerald-500/15 text-emerald-500" : post.status === "failed" ? "bg-rose-500/15 text-rose-500" : post.status === "processing" ? "bg-amber-500/15 text-amber-500" : "bg-indigo-500/15 text-indigo-400"}>{post.status === "pending" ? "Scheduled" : post.status}</Badge></div><p className="line-clamp-2 text-sm leading-6">{post.content}</p><p className="text-xs text-muted-foreground">{post.status === "published" && post.publishedAt ? `Published ${formatDateTime(post.publishedAt)}` : `Scheduled ${formatDateTime(post.scheduledAt)}`}</p>{post.errorMessage && <p className="text-xs text-destructive">{post.errorMessage}</p>}</div>{(post.status === "pending" || post.status === "failed") && <Button type="button" size="sm" variant="ghost" className="self-end text-destructive hover:text-destructive sm:self-auto" onClick={() => deletePost(post.id)} disabled={removeSchedule.isPending}><Trash2 className="mr-1 h-4 w-4" />Remove</Button>}</CardContent></Card>)}</TabsContent>
    </Tabs>
  </main></DashboardLayout>;
}
