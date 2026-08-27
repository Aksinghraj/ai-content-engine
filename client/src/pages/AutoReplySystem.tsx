import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Bot, Brain, CheckCircle2, Heart, Loader2, MessageSquare, Minus, Plus, Settings, Shield, ThumbsDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const PLATFORMS = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];
const PLATFORM_EMOJIS: Record<string, string> = { instagram: "📸", twitter: "𝕏", linkedin: "💼", facebook: "👥", youtube: "▶️", tiktok: "🎵" };
const INTENT_LABELS: Record<string, string> = { question: "Question", praise: "Praise", support_issue: "Support issue", spam: "Spam", other: "Other" };

function sentimentIcon(sentiment: string) { return sentiment === "positive" ? <Heart className="h-4 w-4 text-emerald-400" /> : sentiment === "negative" ? <ThumbsDown className="h-4 w-4 text-red-400" /> : <Minus className="h-4 w-4 text-amber-400" />; }

function AutoReplyContent() {
  const [tab, setTab] = useState("dashboard");
  const [testComment, setTestComment] = useState("");
  const [testPlatform, setTestPlatform] = useState("instagram");
  const [testResult, setTestResult] = useState<{ sentiment: string; score: number; intent: string; reply: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const utils = trpc.useUtils();
  const eventsQuery = trpc.enterprise.getEngagementEvents.useQuery({ limit: 50 });
  const knowledgeQuery = trpc.enterprise.getKnowledgeBase.useQuery();
  const rulesQuery = trpc.enterprise.getAutoReplyRules.useQuery();
  const analyze = trpc.enterprise.analyzeSentiment.useMutation();
  const generateReply = trpc.enterprise.generateAutoReply.useMutation();
  const createKnowledge = trpc.enterprise.createKnowledgeBase.useMutation({ onSuccess: () => utils.enterprise.getKnowledgeBase.invalidate() });
  const deleteKnowledge = trpc.enterprise.deleteKnowledgeBase.useMutation({ onSuccess: () => utils.enterprise.getKnowledgeBase.invalidate() });
  const updateRule = trpc.enterprise.updateAutoReplyRule.useMutation({ onSuccess: () => utils.enterprise.getAutoReplyRules.invalidate() });
  const events = eventsQuery.data ?? [];
  const knowledge = knowledgeQuery.data ?? [];
  const rules = rulesQuery.data ?? [];
  const counts = useMemo(() => ({ positive: events.filter((event) => event.sentiment === "positive").length, neutral: events.filter((event) => event.sentiment === "neutral").length, negative: events.filter((event) => event.sentiment === "negative").length, escalated: events.filter((event) => event.isEscalated).length }), [events]);
  const busy = analyze.isPending || generateReply.isPending;
  const runTest = async () => { if (!testComment.trim()) return; try { const sentiment = await analyze.mutateAsync({ text: testComment }); const reply = await generateReply.mutateAsync({ commentContent: testComment, intent: sentiment.intent, platform: testPlatform }); setTestResult({ sentiment: sentiment.sentiment, score: sentiment.score, intent: sentiment.intent, reply: String(reply.reply ?? "") }); toast.success("Your text was analyzed."); } catch { toast.error("Lumae could not analyze this text. Please try again."); } };
  const addKnowledge = async () => { if (!title.trim() || !content.trim()) return toast.error("Add both a title and content."); try { await createKnowledge.mutateAsync({ title: title.trim(), content: content.trim() }); setTitle(""); setContent(""); toast.success("Knowledge entry saved."); } catch { toast.error("Could not save the knowledge entry."); } };
  const statistics = [
    { label: "Positive", value: counts.positive, icon: Heart, className: "text-emerald-400" },
    { label: "Neutral", value: counts.neutral, icon: Minus, className: "text-amber-400" },
    { label: "Negative", value: counts.negative, icon: ThumbsDown, className: "text-red-400" },
    { label: "Escalated", value: counts.escalated, icon: AlertTriangle, className: "text-orange-400" },
  ];

  return <main className="min-h-screen bg-background p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-6"><header><h1 className="flex items-center gap-3 text-3xl font-bold text-foreground sm:text-4xl"><Bot className="h-8 w-8 text-primary" />Auto-Reply</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Review only real incoming events connected to your account. Until a provider sends events, Lumae shows an empty inbox.</p></header>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{statistics.map(({ label, value, icon: Icon, className }) => <Card key={label}><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold text-foreground">{value}</p></div><Icon className={`h-6 w-6 ${className}`} /></CardContent></Card>)}</section>
    <Tabs value={tab} onValueChange={setTab} className="space-y-5"><TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted p-1 sm:grid-cols-4"><TabsTrigger value="dashboard">Inbox</TabsTrigger><TabsTrigger value="test">Test AI</TabsTrigger><TabsTrigger value="knowledge">Knowledge</TabsTrigger><TabsTrigger value="rules">Rules</TabsTrigger></TabsList>
      <TabsContent value="dashboard" className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-foreground">Incoming events</h2><Badge variant="outline"><Shield className="mr-1 h-3.5 w-3.5" />Account data only</Badge></div>{eventsQuery.isLoading ? <Card><CardContent className="p-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /> <p className="mt-3">Loading incoming events…</p></CardContent></Card> : events.length === 0 ? <Card><CardContent className="p-10 text-center"><MessageSquare className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-3 font-medium text-foreground">No incoming events yet</p><p className="mt-1 text-sm text-muted-foreground">Connect an approved provider and receive a real comment or message to see it here.</p></CardContent></Card> : events.map((event) => <Card key={event.id}><CardContent className="p-4"><div className="flex flex-wrap items-center gap-2"><span>{PLATFORM_EMOJIS[event.platform] || "💬"}</span><span className="font-medium text-foreground">{event.authorName}</span><Badge variant="outline" className="capitalize">{event.platform}</Badge><span className="flex items-center gap-1 text-xs capitalize text-muted-foreground">{sentimentIcon(event.sentiment)}{event.sentiment}</span><Badge variant="secondary">{INTENT_LABELS[event.intent] || "Other"}</Badge>{event.isEscalated && <Badge variant="destructive">Escalated</Badge>}</div><p className="mt-3 text-sm text-foreground">{event.content}</p><p className="mt-3 text-xs text-muted-foreground">Received {new Date(event.createdAt).toLocaleString()}</p></CardContent></Card>)}</TabsContent>
      <TabsContent value="test"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Test with your own text</CardTitle><CardDescription>This test does not create a social event or send a reply.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-4"><div className="space-y-2 md:col-span-3"><Label>Comment or message</Label><Textarea value={testComment} onChange={(event) => setTestComment(event.target.value)} placeholder="Enter text you want Lumae to analyze" className="min-h-28" /></div><div className="space-y-2"><Label>Platform</Label><Select value={testPlatform} onValueChange={setTestPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PLATFORMS.map((platform) => <SelectItem key={platform} value={platform}>{PLATFORM_EMOJIS[platform]} {platform}</SelectItem>)}</SelectContent></Select></div></div><Button onClick={runTest} disabled={busy || !testComment.trim()} className="lumae-gradient-cta">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}Analyze and draft reply</Button>{testResult && <div className="rounded-md border border-border bg-muted/30 p-4"><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1 capitalize">{sentimentIcon(testResult.sentiment)}{testResult.sentiment} ({Math.round(testResult.score * 100)}%)</span><Badge variant="secondary">{INTENT_LABELS[testResult.intent] || "Other"}</Badge></div><p className="mt-3 text-sm text-muted-foreground">Suggested reply</p><p className="mt-1 text-sm text-foreground">{testResult.reply}</p></div>}</CardContent></Card></TabsContent>
      <TabsContent value="knowledge"><Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Knowledge base</CardTitle><CardDescription>Add only information you want the reply assistant to use.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: Returns policy" /></div><div className="space-y-2"><Label>Content</Label><Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Information for replies" /></div></div><Button onClick={addKnowledge} disabled={createKnowledge.isPending} className="lumae-gradient-cta"><Plus className="mr-2 h-4 w-4" />Save knowledge</Button>{knowledgeQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading saved knowledge…</p> : knowledge.length === 0 ? <p className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No knowledge entries saved.</p> : <div className="space-y-2">{knowledge.map((entry) => <div key={entry.id} className="flex items-start justify-between gap-4 rounded-md border border-border p-3"><div><p className="font-medium text-foreground">{entry.title}</p><p className="mt-1 text-sm text-muted-foreground">{entry.content}</p></div><Button variant="ghost" size="icon" disabled={deleteKnowledge.isPending} onClick={() => deleteKnowledge.mutate({ id: entry.id })} aria-label={`Delete ${entry.title}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</div>}</CardContent></Card></TabsContent>
      <TabsContent value="rules"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Auto-reply rules</CardTitle><CardDescription>Only your saved rules appear here. Turning a rule on does not send a reply until a validated provider supports it.</CardDescription></CardHeader><CardContent className="space-y-3">{rulesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading rules…</p> : rules.length === 0 ? <p className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No rules saved yet.</p> : rules.map((rule) => <div key={rule.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3"><div className="min-w-0"><p className="font-medium text-foreground">{rule.platform ? `${PLATFORM_EMOJIS[rule.platform] || "💬"} ${rule.platform}` : "All platforms"} · {INTENT_LABELS[rule.intent] || "Other"}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{rule.replyTemplate}</p></div><Switch checked={rule.isActive} disabled={updateRule.isPending} onCheckedChange={(isActive) => updateRule.mutate({ id: rule.id, isActive })} aria-label={`Toggle ${rule.intent} rule`} /></div>)}</CardContent></Card></TabsContent>
    </Tabs></div></main>;
}

export default function AutoReplySystem() { return <DashboardLayout><AutoReplyContent /></DashboardLayout>; }
