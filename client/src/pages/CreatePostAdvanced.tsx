import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, CheckCircle2, FileImage, Loader2, Save, Send, Sparkles, Trash2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LumaeLightPulse } from "@/components/LumaeLightPulse";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", maxChars: 2200, requirement: "Requires a managed image or video." },
  { id: "facebook", name: "Facebook", icon: "👥", maxChars: 5000, requirement: "Text posts are supported." },
  { id: "twitter", name: "Twitter / X", icon: "𝕏", maxChars: 280, requirement: "Publishing is locked until an API budget is approved." },
  { id: "linkedin", name: "LinkedIn", icon: "💼", maxChars: 3000, requirement: "Text-only posts are supported." },
  { id: "youtube", name: "YouTube", icon: "📺", maxChars: 5000, requirement: "Requires a managed video; uploads are private." },
  { id: "tiktok", name: "TikTok", icon: "🎵", maxChars: 2200, requirement: "Requires a managed video." },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];
type UploadedMedia = { url: string; key: string; mediaType: "image" | "video"; filename: string };

function defaultDateTime() {
  const later = new Date(Date.now() + 60 * 60 * 1000);
  return new Date(later.getTime() - later.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function CreatePostAdvanced() {
  const [tab, setTab] = useState("editor");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const [hashtags, setHashtags] = useState("");
  const [mentions, setMentions] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultDateTime);
  const [media, setMedia] = useState<UploadedMedia | null>(null);
  const [publishResults, setPublishResults] = useState<{ platform: string; success: boolean; detail: string }[]>([]);
  const utils = trpc.useUtils();
  const accounts = trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();
  const drafts = trpc.socialMedia.getDrafts.useQuery();
  const upload = trpc.socialMedia.uploadMedia.useMutation();
  const saveDraft = trpc.socialMedia.saveDraft.useMutation();
  const deleteDraft = trpc.socialMedia.deleteDraft.useMutation();
  const schedule = trpc.socialMedia.schedulePost.useMutation();
  const publish = trpc.socialPosting.postToMultiplePlatforms.useMutation();
  const generate = trpc.aiPostGeneration.generateForPlatform.useMutation();
  const accountByPlatform = useMemo(() => new Map((accounts.data ?? []).map((item) => [item.platform, item])), [accounts.data]);
  const isReady = (id: PlatformId, requireAutoPost: boolean) => {
    const account = accountByPlatform.get(id);
    return Boolean(account?.isConnected && account.isValidated && (!requireAutoPost || account.autoPost) && (!account.tokenExpiresAt || new Date(account.tokenExpiresAt).getTime() > Date.now()));
  };
  const maxChars = platforms.length ? Math.min(...PLATFORMS.filter((item) => platforms.includes(item.id)).map((item) => item.maxChars)) : 5000;
  const parsedHashtags = hashtags.split(/[\s,]+/).map((value) => value.replace(/^#/, "").trim()).filter(Boolean);
  const parsedMentions = mentions.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean);

  const toggle = (id: PlatformId) => {
    if (!isReady(id, false)) return toast.error(`Connect and validate ${PLATFORMS.find((item) => item.id === id)?.name} before creating a post for it.`);
    if (id === "twitter") return toast.error("Twitter / X publishing is unavailable until an API budget is approved.");
    setPlatforms((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const chooseMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return toast.error("Choose an image or video file.");
    if (file.size > 650 * 1024) return toast.error("This file is larger than the current managed-media limit of 650 KB.");
    try {
      const fileData = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] || ""); reader.onerror = () => reject(new Error("The selected file could not be read.")); reader.readAsDataURL(file); });
      const saved = await upload.mutateAsync({ filename: file.name, fileData, mediaType: file.type.startsWith("video/") ? "video" : "image" });
      setMedia({ url: saved.url, key: saved.key, mediaType: saved.mediaType, filename: saved.filename });
      toast.success("Media uploaded securely and ready to use.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Media upload failed."); }
  };

  const validate = (forSchedule: boolean) => {
    if (!content.trim()) { toast.error("Write or generate post content first."); return false; }
    if (!platforms.length) { toast.error("Select at least one validated account."); return false; }
    if (content.length > maxChars) { toast.error(`Shorten the post to ${maxChars.toLocaleString()} characters for the selected platform.`); return false; }
    if (forSchedule && platforms.some((platform) => !isReady(platform, true))) { toast.error("Enable Auto-Post for every selected account before scheduling."); return false; }
    if (platforms.includes("instagram") && !media) { toast.error("Instagram requires a managed image or video."); return false; }
    if (platforms.includes("youtube") && media?.mediaType !== "video") { toast.error("YouTube requires a managed video."); return false; }
    if (platforms.includes("linkedin") && media) { toast.error("LinkedIn is text-only at this time. Publish or schedule it separately without media."); return false; }
    return true;
  };

  const generateContent = async () => {
    if (!topic.trim()) return toast.error("Enter a topic before generating content.");
    const platform = platforms[0] ?? "instagram";
    try {
      const result = await generate.mutateAsync({ topic, platform, tone: "professional", includeHashtags: true, includeEmoji: platform !== "linkedin" });
      setContent(result.content);
      if (!platforms.length) setPlatforms([platform]);
      setTab("editor");
      toast.success("Your AI draft is ready to review and edit.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Content generation failed."); }
  };

  const persistDraft = async () => {
    if (!content.trim()) return toast.error("Write or generate content before saving a draft.");
    try {
      await saveDraft.mutateAsync({ title: title.trim() || undefined, content, platforms, hashtags: parsedHashtags, mentions: parsedMentions, mediaUrl: media?.url, mediaType: media?.mediaType, mediaKey: media?.key });
      await utils.socialMedia.getDrafts.invalidate();
      toast.success("Draft saved. It will not publish until you choose Publish Now or Schedule Post.");
      setTab("drafts");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save the draft."); }
  };

  const publishNow = async () => {
    if (!validate(false)) return;
    try {
      const response = await publish.mutateAsync({ platforms, text: content, imageUrl: media?.mediaType === "image" ? media.url : undefined, videoUrl: media?.mediaType === "video" ? media.url : undefined, hashtags: parsedHashtags });
      const success = response.successful.map((item) => ({ platform: item.platform, success: true, detail: "Published" }));
      const failed = response.failed.map((item) => ({ platform: item.platform, success: false, detail: item.error || "Publishing failed" }));
      setPublishResults([...success, ...failed]);
      if (!failed.length) toast.success(`Published to ${success.length} platform${success.length === 1 ? "" : "s"}.`);
      else toast.error(`${failed.length} provider result${failed.length === 1 ? "" : "s"} reported a failure.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Publishing failed."); }
  };

  const schedulePost = async () => {
    if (!validate(true)) return;
    try {
      const time = new Date(scheduledAt);
      if (Number.isNaN(time.getTime()) || time.getTime() <= Date.now()) return toast.error("Choose a future date and time.");
      const results = await Promise.allSettled(platforms.map((platform) => {
        const account = accountByPlatform.get(platform);
        if (!account) return Promise.reject(new Error(`No ${platform} connection is available.`));
        return schedule.mutateAsync({ socialConnectionId: account.id, platform, content, scheduledAt: time, mediaUrl: media?.url, mediaType: media?.mediaType, mediaKey: media?.key });
      }));
      await utils.socialMedia.getScheduledPosts.invalidate();
      const outcomes = results.map((result, index) => result.status === "fulfilled"
        ? { platform: platforms[index], success: true, detail: `Scheduled for ${time.toLocaleString()}` }
        : { platform: platforms[index], success: false, detail: result.reason instanceof Error ? result.reason.message : "Scheduling failed before the post was saved." });
      setPublishResults(outcomes);
      const failed = outcomes.filter((result) => !result.success);
      if (failed.length) toast.error(failed.map((result) => `${result.platform}: ${result.detail}`).join(" "));
      else toast.success(`Scheduled for ${platforms.length} platform${platforms.length === 1 ? "" : "s"}.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Scheduling failed before the post was saved.";
      setPublishResults([{ platform: "schedule", success: false, detail }]);
      toast.error(detail);
    }
  };

  const removeDraft = async (draftId: number) => { try { await deleteDraft.mutateAsync({ draftId }); await utils.socialMedia.getDrafts.invalidate(); toast.success("Draft removed."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to remove draft."); } };

  return <DashboardLayout><main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8"><header className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Content Studio</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create Post Pro</h1><p className="max-w-3xl text-sm leading-6 text-muted-foreground">Create, save, schedule, or publish posts using actual connected accounts. No projected reach, engagement, or fabricated drafts are shown.</p></header>
    <Tabs value={tab} onValueChange={setTab} className="space-y-5"><TabsList className="grid h-auto w-full grid-cols-3 bg-muted p-1"><TabsTrigger value="editor" className="min-h-10 px-2 text-xs sm:text-sm">Editor</TabsTrigger><TabsTrigger value="generate" className="min-h-10 px-2 text-xs sm:text-sm">AI generate</TabsTrigger><TabsTrigger value="drafts" className="min-h-10 px-2 text-xs sm:text-sm">Drafts</TabsTrigger></TabsList>
      <TabsContent value="editor" className="mt-0"><div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"><section className="space-y-5"><Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-3"><CardTitle className="text-lg">Write and review</CardTitle><CardDescription>Publishing controls stay visible and tell you exactly what will happen.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="post-title">Title <span className="font-normal text-muted-foreground">(for your saved drafts only)</span></Label><Input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Campaign or draft name" className="bg-background" /></div><div className="space-y-2"><Label htmlFor="post-copy">Post content</Label><Textarea id="post-copy" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a post or generate a starting draft." className="min-h-52 resize-y bg-background" /><p className={`text-right text-xs ${content.length > maxChars ? "text-destructive" : "text-muted-foreground"}`}>{content.length.toLocaleString()} / {maxChars.toLocaleString()} characters</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="hashtags">Hashtags</Label><Input id="hashtags" value={hashtags} onChange={(event) => setHashtags(event.target.value)} placeholder="#launch #creators" className="bg-background" /></div><div className="space-y-2"><Label htmlFor="mentions">Mentions</Label><Input id="mentions" value={mentions} onChange={(event) => setMentions(event.target.value)} placeholder="@partner" className="bg-background" /></div></div><div className="space-y-2"><Label htmlFor="post-time">Schedule time</Label><Input id="post-time" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="max-w-sm bg-background" /></div><div className="space-y-2"><Label>Managed media <span className="font-normal text-muted-foreground">(one file, up to 650 KB)</span></Label>{media ? <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 p-3"><FileImage className="h-5 w-5 text-muted-foreground" /><span className="min-w-0 flex-1 truncate text-sm">{media.filename}</span><Badge variant="outline">{media.mediaType}</Badge><Button type="button" size="sm" variant="ghost" onClick={() => setMedia(null)}><XCircle className="mr-1 h-4 w-4" />Remove</Button></div> : <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 text-center hover:bg-muted">{upload.isPending ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <UploadCloud className="h-5 w-5 text-muted-foreground" />}<span className="mt-2 text-sm font-medium">Upload image or video</span><input className="sr-only" type="file" accept="image/*,video/*" onChange={chooseMedia} disabled={upload.isPending} /></label>}</div><div className="grid gap-2 border-t border-border pt-4 sm:grid-cols-3"><Button type="button" variant="outline" onClick={persistDraft} disabled={saveDraft.isPending || !content.trim()}>{saveDraft.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save draft</Button><Button type="button" variant="outline" onClick={schedulePost} disabled={schedule.isPending || !content.trim() || !platforms.length}><Calendar className="mr-2 h-4 w-4" />Schedule post</Button><Button type="button" onClick={publishNow} disabled={publish.isPending || !content.trim() || !platforms.length} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90">{publish.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Publish now</Button></div></CardContent></Card>
        {publishResults.length > 0 && <Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-base">Publishing results</CardTitle><CardDescription>Actual provider outcomes from your most recent attempt.</CardDescription></CardHeader><CardContent className="space-y-2">{publishResults.map((result) => <div key={result.platform} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">{result.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />}<div><p className="font-medium capitalize">{result.platform}</p><p className="text-xs text-muted-foreground">{result.detail}</p></div></div>)}</CardContent></Card>}</section>
        <aside><Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-3"><CardTitle className="text-base">Choose accounts</CardTitle><CardDescription className="text-xs">Only validated connections can be selected.</CardDescription></CardHeader><CardContent className="space-y-2">{accounts.isLoading ? <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading accounts</div> : PLATFORMS.map((platform) => { const account = accountByPlatform.get(platform.id); const ready = isReady(platform.id, false); const checked = platforms.includes(platform.id); return <button key={platform.id} type="button" onClick={() => toggle(platform.id)} aria-pressed={checked} className={`w-full rounded-md border p-3 text-left ${checked ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"}`}><span className="flex items-start gap-2"><span className="text-lg">{platform.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{platform.name}</span><Badge variant="outline" className={ready && platform.id !== "twitter" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>{ready && platform.id !== "twitter" ? "Ready" : "Not ready"}</Badge></span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{ready && account?.username ? `@${account.username}` : platform.requirement}</span></span></span></button>; })}</CardContent></Card></aside></div></TabsContent>
      <TabsContent value="generate" className="mt-0"><Card className="border-border bg-card text-card-foreground"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-primary" />Generate a starting draft</CardTitle><CardDescription>This creates editable text. It will never publish a post automatically.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="topic">Topic</Label><Input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="For example: launch announcement for creators" className="bg-background" /></div><Button type="button" onClick={generateContent} disabled={generate.isPending || !topic.trim()} className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90">{generate.isPending ? <><LumaeLightPulse state="working" size={18} className="mr-2" label="Lumae is generating your draft" />Generating content</> : <><Sparkles className="mr-2 h-4 w-4" />Generate content</>}</Button></CardContent></Card></TabsContent>
      <TabsContent value="drafts" className="mt-0 space-y-3">{drafts.isLoading ? <Card className="border-border bg-card p-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /><p className="mt-2 text-sm">Loading saved drafts</p></Card> : !(drafts.data?.length) ? <Card className="border-border bg-card p-8 text-center"><Save className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-medium">No saved drafts</p><p className="mt-1 text-sm text-muted-foreground">Save a draft to return to it later. Saved drafts do not publish automatically.</p></Card> : drafts.data.map((draft) => <Card key={draft.id} className="border-border bg-card text-card-foreground"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-medium">{draft.title || "Untitled draft"}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{draft.content}</p><div className="mt-3 flex flex-wrap gap-2">{draft.platforms.map((platform) => <Badge key={platform} variant="outline">{platform}</Badge>)}</div><p className="mt-3 text-xs text-muted-foreground">Saved {new Date(draft.updatedAt).toLocaleString()}</p></div><Button type="button" size="sm" variant="ghost" className="self-end text-destructive hover:text-destructive sm:self-auto" onClick={() => removeDraft(draft.id)} disabled={deleteDraft.isPending}><Trash2 className="mr-1 h-4 w-4" />Remove</Button></CardContent></Card>)}</TabsContent>
    </Tabs>
  </main></DashboardLayout>;
}
