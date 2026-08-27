import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ContentCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const utils = trpc.useUtils();
  const postsQuery = trpc.socialMedia.getScheduledPosts.useQuery();
  const deletePost = trpc.socialMedia.deletePost.useMutation({ onSuccess: () => { void utils.socialMedia.getScheduledPosts.invalidate(); toast.success("Scheduled post deleted."); }, onError: (error) => toast.error(error.message || "Could not delete this post.") });
  const posts = postsQuery.data ?? [];
  const monthPosts = useMemo(() => posts.filter((post) => { const date = new Date(post.scheduledAt); return date.getMonth() === month && date.getFullYear() === year; }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()), [posts, month, year]);
  const platforms = new Set(monthPosts.map((post) => post.platform)).size;
  const previous = () => month === 0 ? (setMonth(11), setYear((value) => value - 1)) : setMonth((value) => value - 1);
  const next = () => month === 11 ? (setMonth(0), setYear((value) => value + 1)) : setMonth((value) => value + 1);
  return <main className="min-h-screen bg-background p-4 sm:p-6"><div className="mx-auto max-w-5xl space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="flex items-center gap-3 text-3xl font-bold text-foreground"><CalendarDays className="h-8 w-8 text-primary" />Content Calendar</h1><p className="mt-2 text-sm text-muted-foreground">Only posts you scheduled in Lumae are displayed.</p></div><Button onClick={() => window.location.assign("/scheduling/post-scheduling")} className="lumae-gradient-cta"><Plus className="mr-2 h-4 w-4" />Schedule a post</Button></header><Card><CardHeader><div className="flex items-center justify-between gap-3"><Button variant="outline" size="sm" onClick={previous} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button><div className="text-center"><CardTitle>{months[month]} {year}</CardTitle><CardDescription>Real scheduled posts only</CardDescription></div><Button variant="outline" size="sm" onClick={next} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button></div></CardHeader><CardContent>{postsQuery.isLoading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading your scheduled posts…</p> : monthPosts.length === 0 ? <div className="py-14 text-center"><CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-medium text-foreground">No scheduled posts this month</p><p className="mt-1 text-sm text-muted-foreground">Lumae does not add sample events to your calendar.</p></div> : <div className="space-y-3">{monthPosts.map((post) => <div key={post.id} className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge className="capitalize">{post.platform}</Badge><Badge variant="outline" className="capitalize">{post.status}</Badge><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{new Date(post.scheduledAt).toLocaleString()}</span></div><p className="mt-2 line-clamp-2 text-sm text-foreground">{post.content}</p>{post.status === "failed" && post.errorMessage && <p className="mt-1 text-xs text-destructive">{post.errorMessage}</p>}</div><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={deletePost.isPending} onClick={() => { if (window.confirm("Delete this scheduled post?")) deletePost.mutate({ postId: post.id }); }}><Trash2 className="mr-1.5 h-4 w-4" />Delete</Button></div>)}</div>}</CardContent></Card><section className="grid grid-cols-3 gap-3">{[["All scheduled", posts.length], ["This month", monthPosts.length], ["Platforms", platforms]].map(([label, value]) => <Card key={label as string}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold text-foreground">{value as number}</p></CardContent></Card>)}</section></div></main>;
}
