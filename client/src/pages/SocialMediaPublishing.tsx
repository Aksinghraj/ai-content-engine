import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle2, FileImage, Loader2, Send, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", maxChars: 2200, requirement: "Requires one managed image or video." },
  { id: "facebook", name: "Facebook", icon: "👥", maxChars: 5000, requirement: "Text posts are supported." },
  { id: "twitter", name: "Twitter / X", icon: "𝕏", maxChars: 280, requirement: "Posting is locked until an API budget is approved." },
  { id: "linkedin", name: "LinkedIn", icon: "💼", maxChars: 3000, requirement: "Text-only posts are supported." },
  { id: "youtube", name: "YouTube", icon: "📺", maxChars: 5000, requirement: "Requires one managed video; uploads are private." },
  { id: "tiktok", name: "TikTok", icon: "🎵", maxChars: 2200, requirement: "Requires one managed video." },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];
type UploadedMedia = { url: string; key: string; mediaType: "image" | "video"; filename: string };

export default function SocialMediaPublishing() {
  const [, navigate] = useLocation();
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<PlatformId[]>([]);
  const [media, setMedia] = useState<UploadedMedia | null>(null);
  const [results, setResults] = useState<{ platform: string; success: boolean; detail: string }[]>([]);
  const accounts = trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();
  const upload = trpc.socialMedia.uploadMedia.useMutation();
  const publish = trpc.socialPosting.postToMultiplePlatforms.useMutation();
  const accountByPlatform = useMemo(() => new Map((accounts.data ?? []).map((item) => [item.platform, item])), [accounts.data]);
  const isValidated = (id: PlatformId) => {
    const account = accountByPlatform.get(id);
    return Boolean(account?.isValidated && (!account.tokenExpiresAt || new Date(account.tokenExpiresAt).getTime() > Date.now()));
  };

  const toggle = (id: PlatformId) => {
    if (!isValidated(id)) return toast.error(`Connect and validate ${PLATFORMS.find((item) => item.id === id)?.name} before publishing.`);
    if (id === "twitter") return toast.error("Twitter / X publishing is unavailable until an API budget is approved.");
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const chooseMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const saved = await upload.mutateAsync({ filename: file.name, fileData, mediaType: file.type.startsWith("video/") ? "video" : "image" });
      setMedia({ url: saved.url, key: saved.key, mediaType: saved.mediaType, filename: saved.filename });
      toast.success("Media uploaded securely and ready to publish.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media upload failed.");
    }
  };

  const publishNow = async () => {
    if (!content.trim()) return toast.error("Write post content before publishing.");
    if (!selected.length) return toast.error("Select at least one validated account.");
    const selectedInfo = PLATFORMS.filter((item) => selected.includes(item.id));
    const tooLong = selectedInfo.find((item) => content.length > item.maxChars);
    if (tooLong) return toast.error(`Shorten this post to ${tooLong.maxChars.toLocaleString()} characters for ${tooLong.name}.`);
    if (selected.includes("instagram") && !media) return toast.error("Instagram requires a managed image or video.");
    if (selected.includes("youtube") && media?.mediaType !== "video") return toast.error("YouTube requires a managed video.");
    if (selected.includes("linkedin") && media) return toast.error("LinkedIn is text-only at this time. Publish it separately without media.");
    try {
      const response = await publish.mutateAsync({ platforms: selected, text: content, imageUrl: media?.mediaType === "image" ? media.url : undefined, videoUrl: media?.mediaType === "video" ? media.url : undefined, hashtags: [] });
      const success = response.successful.map((item) => ({ platform: item.platform, success: true, detail: "Published" }));
      const failed = response.failed.map((item) => ({ platform: item.platform, success: false, detail: item.error || "Publishing failed" }));
      setResults([...success, ...failed]);
      if (!failed.length) {
        toast.success(`Published to ${success.length} platform${success.length === 1 ? "" : "s"}.`);
        setContent(""); setSelected([]); setMedia(null);
      } else toast.error(`${failed.length} platform${failed.length === 1 ? "" : "s"} did not publish. See the provider result below.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publishing failed.");
    }
  };

  return <DashboardLayout><main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
    <header className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Scheduling</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Social publishing</h1><p className="max-w-3xl text-sm leading-6 text-muted-foreground">Publish immediately to validated accounts. Every result comes from the provider; Lumae does not simulate a successful post.</p></header>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]"><section className="space-y-5"><Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-3"><CardTitle className="text-lg">Write your post</CardTitle><CardDescription>Immediate publishing does not require Auto-Post. Auto-Post is needed only for scheduled publishing.</CardDescription></CardHeader><CardContent className="space-y-4"><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What would you like to publish?" className="min-h-44 w-full resize-y rounded-md border border-input bg-background p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" /><p className="text-right text-xs text-muted-foreground">{content.length.toLocaleString()} characters</p><div className="space-y-2"><p className="text-sm font-medium">Managed media <span className="font-normal text-muted-foreground">(one file, up to 650 KB)</span></p>{media ? <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 p-3"><FileImage className="h-5 w-5 text-muted-foreground" /><span className="min-w-0 flex-1 truncate text-sm">{media.filename}</span><Badge variant="outline">{media.mediaType}</Badge><Button type="button" size="sm" variant="ghost" onClick={() => setMedia(null)}><XCircle className="mr-1 h-4 w-4" />Remove</Button></div> : <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 text-center hover:bg-muted"><>{upload.isPending ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <UploadCloud className="h-5 w-5 text-muted-foreground" />}</><span className="mt-2 text-sm font-medium">Upload image or video</span><span className="mt-1 text-xs text-muted-foreground">Used only with the post you publish</span><input className="sr-only" type="file" accept="image/*,video/*" onChange={chooseMedia} disabled={upload.isPending} /></label>}</div><div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => navigate("/scheduling/post-scheduling")}><Calendar className="mr-2 h-4 w-4" />Schedule instead</Button><Button type="button" onClick={publishNow} disabled={publish.isPending || !content.trim() || !selected.length} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white hover:opacity-90">{publish.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Publish now</Button></div></CardContent></Card>
      {results.length > 0 && <Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-2"><CardTitle className="text-base">Publishing results</CardTitle><CardDescription>Provider-confirmed outcome for this publish attempt.</CardDescription></CardHeader><CardContent className="space-y-2">{results.map((result) => <div key={result.platform} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">{result.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />}<div><p className="font-medium capitalize">{result.platform}</p><p className="text-xs text-muted-foreground">{result.detail}</p></div></div>)}</CardContent></Card>}</section>
      <aside><Card className="border-border bg-card text-card-foreground"><CardHeader className="pb-3"><CardTitle className="text-base">Choose accounts</CardTitle><CardDescription className="text-xs">Only validated connections can be used.</CardDescription></CardHeader><CardContent className="space-y-2">{accounts.isLoading ? <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading accounts</div> : PLATFORMS.map((platform) => { const valid = isValidated(platform.id); const checked = selected.includes(platform.id); return <button key={platform.id} type="button" onClick={() => toggle(platform.id)} aria-pressed={checked} className={`w-full rounded-md border p-3 text-left ${checked ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"}`}><span className="flex items-start gap-2"><span className="text-lg">{platform.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{platform.name}</span><Badge variant="outline" className={valid && platform.id !== "twitter" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>{valid && platform.id !== "twitter" ? "Ready" : "Not ready"}</Badge></span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{valid && accountByPlatform.get(platform.id)?.username ? `@${accountByPlatform.get(platform.id)?.username}` : platform.requirement}</span></span></span></button>; })}{!PLATFORMS.some((platform) => isValidated(platform.id) && platform.id !== "twitter") && <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => navigate("/scheduling/connected-accounts")}>Open connected accounts</Button>}</CardContent></Card></aside>
    </div>
  </main></DashboardLayout>;
}
