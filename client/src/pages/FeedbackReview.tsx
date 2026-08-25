import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardList, ExternalLink, Image, RefreshCw, ShieldAlert } from "lucide-react";
import { useState } from "react";

const statuses = ["new", "reviewed", "resolved"] as const;
type FeedbackStatus = (typeof statuses)[number];

function FeedbackReviewContent() {
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<FeedbackStatus | "all">("new");
  const reports = trpc.feedback.review.useQuery(filter === "all" ? undefined : { status: filter });
  const updateStatus = trpc.feedback.updateStatus.useMutation({ onSuccess: () => utils.feedback.review.invalidate() });

  if (reports.error) {
    return <section className="mx-auto max-w-3xl rounded-xl border border-destructive/30 bg-destructive/10 p-6"><ShieldAlert className="h-6 w-6 text-destructive" /><h1 className="mt-3 text-xl font-semibold text-foreground">Feedback review is restricted</h1><p className="mt-2 text-sm text-muted-foreground">Only the Lumae owner can review private user feedback.</p></section>;
  }

  return <section className="mx-auto w-full max-w-6xl space-y-6 pb-10">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="lumae-eyebrow"><span className="lumae-live-dot" />Owner operations</p><h1 className="text-3xl font-semibold tracking-tight text-foreground">Feedback review</h1><p className="mt-2 text-sm text-muted-foreground">Review reports privately, open validated screenshots, and keep resolution status current.</p></div><Button variant="outline" onClick={() => reports.refetch()} disabled={reports.isFetching} className="gap-2"><RefreshCw className={`h-4 w-4 ${reports.isFetching ? "animate-spin" : ""}`} />Refresh</Button></header>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter feedback by status">{(["all", ...statuses] as const).map((status) => <Button key={status} variant={filter === status ? "default" : "outline"} size="sm" className="capitalize" onClick={() => setFilter(status)}>{status}</Button>)}</div>
    {reports.isLoading ? <p className="text-sm text-muted-foreground">Loading feedback…</p> : <div className="space-y-3">{reports.data?.length ? reports.data.map((report) => <article key={report.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold text-foreground">{"★".repeat(report.rating)}<span className="text-muted-foreground">{"★".repeat(5 - report.rating)}</span> · <span className="capitalize">{report.category.replace("_", " ")}</span></p><p className="mt-1 text-xs text-muted-foreground">{report.userName || "Lumae user"} · {report.userEmail || "No email"} · {new Date(report.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-2"><span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium capitalize text-foreground">{report.status}</span><select value={report.status} onChange={(event) => updateStatus.mutate({ id: report.id, status: event.target.value as FeedbackStatus })} disabled={updateStatus.isPending} className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"><option value="new">Mark new</option><option value="reviewed">Mark reviewed</option><option value="resolved">Mark resolved</option></select></div></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">{report.message}</p><div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>Area: {report.pagePath || "Not specified"}</span>{report.attachmentUrl && <a href={report.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><Image className="h-3.5 w-3.5" />{report.attachmentName || "Open screenshot"}<ExternalLink className="h-3.5 w-3.5" /></a>}</div></article>) : <div className="rounded-xl border border-dashed border-border p-10 text-center"><ClipboardList className="mx-auto h-7 w-7 text-muted-foreground" /><h2 className="mt-3 font-semibold text-foreground">No feedback in this view</h2><p className="mt-1 text-sm text-muted-foreground">New reports will appear here as users submit them.</p></div>}</div>}
  </section>;
}

export default function FeedbackReviewPage() {
  return <DashboardLayout><FeedbackReviewContent /></DashboardLayout>;
}
