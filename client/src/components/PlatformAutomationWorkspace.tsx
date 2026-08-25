import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LumaeLightPulse } from "@/components/LumaeLightPulse";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Facebook,
  Instagram,
  Link2,
  LockKeyhole,
  MessageCircleReply,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Tv,
  X,
} from "lucide-react";

type PlatformId = "instagram" | "youtube" | "twitter" | "facebook";
type StatusKind = "ready" | "warning" | "locked";

type Workspace = {
  id: PlatformId;
  name: string;
  icon: typeof Instagram;
  description: string;
  dmTitle: string;
  dmDetail: string;
  replyDetail: string;
  policy: string;
  dmAvailable: boolean;
  replyAvailable: boolean;
};

const WORKSPACES: Workspace[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Keep Instagram publishing, comment responses, and private-reply preparation in one focused workspace.",
    dmTitle: "Comment-triggered private reply",
    dmDetail: "One qualifying private reply can be prepared for review. This launch never sends it automatically.",
    replyDetail: "AI can prepare a comment response, but a person reviews every action before a Meta-approved event flow exists.",
    policy: "Meta limits comment-triggered private replies. Lumae keeps this workspace manual-review-first.",
    dmAvailable: true,
    replyAvailable: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Tv,
    description: "Manage YouTube comment-response preparation and channel publishing separately from every other network.",
    dmTitle: "Auto-DM unavailable",
    dmDetail: "YouTube does not provide channel-to-viewer direct messages through its Data API.",
    replyDetail: "YouTube comment replies can be prepared for manual review after the channel is connected.",
    policy: "YouTube supports comment replies and publishing, but not direct-message automation.",
    dmAvailable: false,
    replyAvailable: true,
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: X,
    description: "Review X automation separately while every external X action remains intentionally locked.",
    dmTitle: "Auto-DM locked",
    dmDetail: "X API execution needs an owner-approved usage budget before Lumae can send any action.",
    replyDetail: "No X reply or direct-message request is sent during the safe launch.",
    policy: "X API interactions are usage-based. Set a budget before enabling real X execution.",
    dmAvailable: false,
    replyAvailable: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    description: "Operate Facebook publishing and reply preparation without mixing it into Instagram or X workflows.",
    dmTitle: "Message automation preparation",
    dmDetail: "Messages remain manual-review-only until Page permissions and event rules are approved.",
    replyDetail: "AI can draft a Facebook comment reply, but it is not sent automatically in this launch.",
    policy: "Facebook messaging and comment automation need Page permissions and an approved event flow.",
    dmAvailable: true,
    replyAvailable: true,
  },
];

const CADENCES = [
  { value: "0 0 9 * * *", label: "Every day at 9:00 AM UTC" },
  { value: "0 0 14 * * 1-5", label: "Weekdays at 2:00 PM UTC" },
  { value: "0 0 9 * * 1", label: "Every Monday at 9:00 AM UTC" },
];

function getStatus(connection: any): { kind: StatusKind; label: string; detail: string } {
  if (!connection?.isConnected) return { kind: "locked", label: "Not connected", detail: "Connect this account before enabling its workspace." };
  if (!connection.isValidated) return { kind: "warning", label: "Reconnect needed", detail: "The saved account token is not validated. Reconnect before publishing." };
  if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt).getTime() <= Date.now()) {
    return { kind: "warning", label: "Token expired", detail: "Reconnect this account before scheduling or publishing." };
  }
  if (!connection.autoPost) return { kind: "warning", label: "Auto-Post off", detail: "Enable Auto-Post in Connected Accounts before creating a schedule." };
  return { kind: "ready", label: "Ready", detail: "Connected, validated, and ready for scheduled publishing." };
}

function StatusBadge({ kind, label }: { kind: StatusKind; label: string }) {
  const classes = kind === "ready" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : kind === "warning" ? "border-amber-400/40 bg-amber-400/10 text-amber-100" : "border-slate-500/40 bg-slate-500/10 text-slate-200";
  const Icon = kind === "ready" ? CheckCircle2 : kind === "warning" ? AlertTriangle : LockKeyhole;
  return <Badge className={`border ${classes}`}><Icon className="mr-1 h-3.5 w-3.5" />{label}</Badge>;
}

export function PlatformAutomationWorkspace() {
  const [, navigate] = useLocation();
  const [activeId, setActiveId] = useState<PlatformId>("instagram");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", niche: "", targetAudience: "", cronExpression: CADENCES[0].value });
  const { data: schedulesData, isLoading: schedulesLoading, refetch } = trpc.automation.list.useQuery();
  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();
  const workspace = WORKSPACES.find((item) => item.id === activeId) ?? WORKSPACES[0];
  const connection = accounts?.find((account: any) => account.platform === activeId);
  const status = getStatus(connection);
  const schedules = schedulesData?.data || [];
  const selectedSchedules = useMemo(() => schedules.filter((schedule: any) => schedule.platform === activeId), [schedules, activeId]);
  const activeCount = selectedSchedules.filter((schedule: any) => schedule.isActive).length;
  const xLocked = activeId === "twitter";

  const createMutation = trpc.automation.create.useMutation({
    onSuccess: () => {
      toast.success(`${workspace.name} schedule created.`);
      setShowForm(false);
      setError(null);
      setDraft({ name: "", niche: "", targetAudience: "", cronExpression: CADENCES[0].value });
      void refetch();
    },
    onError: (mutationError) => setError(mutationError.message || "Unable to create this schedule."),
  });
  const updateMutation = trpc.automation.update.useMutation({
    onSuccess: () => { toast.success("Schedule updated."); void refetch(); },
    onError: (mutationError) => toast.error(mutationError.message || "Unable to update schedule."),
  });
  const deleteMutation = trpc.automation.delete.useMutation({
    onSuccess: () => { toast.success("Schedule removed."); void refetch(); },
    onError: (mutationError) => toast.error(mutationError.message || "Unable to delete schedule."),
  });
  const runNowMutation = trpc.automation.runNow.useMutation({
    onSuccess: (result) => { toast.success(result.message); void refetch(); },
    onError: (mutationError) => toast.error(mutationError.message || "Diagnostic run failed."),
  });

  const openAccounts = () => navigate("/scheduling/connected-accounts");
  const selectWorkspace = (id: PlatformId) => { setActiveId(id); setShowForm(false); setError(null); };
  const createSchedule = () => {
    if (xLocked) return setError("X execution is locked until an owner-approved API usage budget is configured.");
    if (!draft.name.trim() || !draft.niche.trim() || !draft.targetAudience.trim()) return setError("Add a schedule name, niche, and target audience before continuing.");
    if (status.kind !== "ready") return setError(status.detail);
    setError(null);
    createMutation.mutate({ ...draft, platform: activeId, goal: "growth", contentStyle: "educational" });
  };
  const runSchedule = (schedule: any) => {
    if (schedule.platform === "twitter") return toast.error("X execution is locked pending an approved API budget.");
    if (!window.confirm(`Publish a real ${workspace.name} post now?`)) return;
    runNowMutation.mutate({ id: schedule.id.toString() });
  };
  const toggleSchedule = (schedule: any) => {
    if (schedule.platform === "twitter" && !schedule.isActive) return toast.error("X execution is locked pending an approved API budget.");
    updateMutation.mutate({ id: schedule.id.toString(), isActive: !schedule.isActive });
  };
  const Icon = workspace.icon;

  return <main className="container space-y-8 py-8 sm:py-10">
    <section className="max-w-3xl space-y-3">
      <Badge className="border-primary/30 bg-primary/10 text-primary">SAFE LAUNCH · MANUAL REVIEW FIRST</Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">One platform at a time.</h1>
      <p className="max-w-2xl text-muted-foreground">Each workspace shows only its own account health, schedule, reply capability, and provider limits. No platform actions are mixed.</p>
    </section>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Automation platforms">
      {WORKSPACES.map((item) => {
        const ItemIcon = item.icon;
        const itemStatus = getStatus(accounts?.find((account: any) => account.platform === item.id));
        const selected = item.id === activeId;
        return <button key={item.id} type="button" role="tab" aria-selected={selected} onClick={() => selectWorkspace(item.id)} className={`min-h-24 border p-3 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
          <div className="flex items-center justify-between"><ItemIcon className="h-5 w-5" /><span className={`h-2 w-2 rounded-full ${itemStatus.kind === "ready" ? "bg-emerald-400" : itemStatus.kind === "warning" ? "bg-amber-400" : "bg-muted-foreground"}`} /></div>
          <p className="mt-4 font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{itemStatus.label}</p>
        </button>;
      })}
    </div>

    <section role="tabpanel" className="border border-primary/25 bg-primary/5 p-5 sm:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary/25"><Icon className="h-6 w-6 text-primary" /></div><div><h2 className="text-2xl font-semibold">{workspace.name} workspace</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{workspace.description}</p></div></div>
        <StatusBadge kind={status.kind} label={status.label} />
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-primary/15 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{status.detail}</p>{status.kind !== "ready" && <Button variant="outline" onClick={openAccounts}><RefreshCw className="mr-2 h-4 w-4" />Connect or reconnect</Button>}</div>
    </section>

    <div className="grid gap-5 xl:grid-cols-3">
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Send className="h-5 w-5 text-primary" />{workspace.dmTitle}</CardTitle><CardDescription>{workspace.dmDetail}</CardDescription></CardHeader><CardContent className="space-y-4"><StatusBadge kind={workspace.dmAvailable ? "warning" : "locked"} label={workspace.dmAvailable ? "Permission required" : "Unavailable"} /><p className="text-sm text-muted-foreground">{workspace.policy}</p><Button variant="outline" disabled className="w-full"><LockKeyhole className="mr-2 h-4 w-4" />{workspace.dmAvailable ? "Waiting for approved events" : "Direct messages unavailable"}</Button></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageCircleReply className="h-5 w-5 text-primary" />Comment reply review</CardTitle><CardDescription>{workspace.replyDetail}</CardDescription></CardHeader><CardContent className="space-y-4"><StatusBadge kind={workspace.replyAvailable ? "warning" : "locked"} label={workspace.replyAvailable ? "Manual review only" : "Execution locked"} /><p className="text-sm text-muted-foreground">No provider comment event is fetched or acted on until the relevant connection and approved event workflow are enabled.</p><Button variant="outline" disabled className="w-full"><Eye className="mr-2 h-4 w-4" />Manual review queue</Button></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-primary" />Workspace analytics</CardTitle><CardDescription>Only operational data that Lumae can verify is shown.</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-3"><Metric label="Schedules" value={selectedSchedules.length} /><Metric label="Active" value={activeCount} /><Metric label="Connection" value={status.kind === "ready" ? "Ready" : "Locked"} /><Metric label="Reply events" value="—" /></CardContent></Card>
    </div>

    <Card><CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" />{workspace.name} schedule</CardTitle><CardDescription>Each schedule belongs to this platform only.</CardDescription></div>{!xLocked && <Button onClick={() => { setShowForm((open) => !open); setError(null); }}><Plus className="mr-2 h-4 w-4" />{showForm ? "Close form" : "Create schedule"}</Button>}</CardHeader><CardContent className="space-y-6">
      {xLocked && <div className="flex gap-3 border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-medium">X execution remains locked</p><p className="mt-1 text-sm text-amber-100/80">Creating, activating, publishing, replying, and DM actions stay disabled until a budget is approved.</p></div></div>}
      {showForm && !xLocked && <div className="border border-primary/25 bg-primary/5 p-5"><div className="grid gap-4 md:grid-cols-2"><Field label="Schedule name" value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value }))} placeholder="Monday creator tip" /><Field label="Niche" value={draft.niche} onChange={(value) => setDraft((current) => ({ ...current, niche: value }))} placeholder="Creator productivity" /><Field label="Target audience" value={draft.targetAudience} onChange={(value) => setDraft((current) => ({ ...current, targetAudience: value }))} placeholder="Early-stage creators" /><div className="space-y-2"><Label>Publishing cadence</Label><Select value={draft.cronExpression} onValueChange={(value) => setDraft((current) => ({ ...current, cronExpression: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CADENCES.map((cadence) => <SelectItem key={cadence.value} value={cadence.value}>{cadence.label}</SelectItem>)}</SelectContent></Select></div></div>{status.kind !== "ready" && <div className="mt-4 flex items-center justify-between gap-3 border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100"><span>{status.detail}</span><Button size="sm" variant="outline" onClick={openAccounts}>Accounts</Button></div>}{error && <p className="mt-4 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}<div className="mt-5 flex flex-col gap-3 sm:flex-row"><Button className="sm:flex-1" onClick={createSchedule} disabled={createMutation.isPending || status.kind !== "ready"}>{createMutation.isPending ? "Creating…" : "Create platform schedule"}</Button><Button className="sm:flex-1" variant="outline" onClick={() => { setShowForm(false); setError(null); }}>Cancel</Button></div></div>}
      {schedulesLoading || accountsLoading ? <p className="flex items-center gap-3 py-6 text-muted-foreground"><LumaeLightPulse state="working" size={18} label="Lumae is checking this workspace" />Checking {workspace.name} schedules…</p> : selectedSchedules.length === 0 ? <div className="border border-dashed border-border p-8 text-center"><Clock3 className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 font-medium">No {workspace.name} schedules yet</p><p className="mt-1 text-sm text-muted-foreground">Schedules created here never publish to another platform.</p></div> : <div className="space-y-3">{selectedSchedules.map((schedule: any) => <ScheduleRow key={schedule.id} schedule={schedule} xLocked={xLocked} running={runNowMutation.isPending} updating={updateMutation.isPending} deleting={deleteMutation.isPending} onRun={() => runSchedule(schedule)} onToggle={() => toggleSchedule(schedule)} onDelete={() => deleteMutation.mutate({ id: schedule.id.toString() })} />)}</div>}
    </CardContent></Card>

    <section className="border border-border bg-muted/30 p-5 text-sm text-muted-foreground"><p className="flex items-center gap-2 font-medium text-foreground"><AlertTriangle className="h-4 w-4 text-amber-400" />Safe launch boundaries</p><p className="mt-2">Lumae does not poll social platforms, auto-send DMs, or fabricate interaction data. Real publishing uses the existing provider connection and requires a validated account with Auto-Post enabled. Comment and DM execution will be enabled only after provider permissions, an event flow, and owner approval are in place.</p></section>
  </main>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border border-border bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>;
}

function ScheduleRow({ schedule, xLocked, running, updating, deleting, onRun, onToggle, onDelete }: { schedule: any; xLocked: boolean; running: boolean; updating: boolean; deleting: boolean; onRun: () => void; onToggle: () => void; onDelete: () => void }) {
  return <div className="flex flex-col gap-4 border border-border bg-background/30 p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{schedule.name}</p><StatusBadge kind={schedule.isActive ? "ready" : "locked"} label={schedule.isActive ? "Active" : "Paused"} /></div><p className="mt-1 text-sm text-muted-foreground">{schedule.niche} · {schedule.targetAudience} · {schedule.cronExpression}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={onRun} disabled={xLocked || running || !schedule.isActive}><Play className="mr-1.5 h-4 w-4" />Run now</Button><Button variant="outline" size="sm" onClick={onToggle} disabled={updating || (xLocked && !schedule.isActive)}>{schedule.isActive ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}{schedule.isActive ? "Pause" : "Activate"}</Button><Button variant="outline" size="icon" onClick={onDelete} disabled={deleting} className="border-destructive/40 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></div></div>;
}
