import { useState } from "react";
import { FileText, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const MAX_IDEA_CHARS = 600;

export default function BasicScriptGeneration() {
  const [, navigate] = useLocation();
  const [idea, setIdea] = useState("");
  const [script, setScript] = useState("");
  const usageQuery = trpc.freeTier.basicScriptUsage.useQuery();
  const generate = trpc.freeTier.generateBasicScript.useMutation({
    onSuccess: () => usageQuery.refetch(),
  });

  const usage = usageQuery.data;

  const handleGenerate = async () => {
    if (idea.trim().length < 3) {
      toast.error("Add a short idea first.");
      return;
    }
    const result = await generate.mutateAsync({ idea: idea.trim() });
    if (!result.success) {
      toast.message("Daily free limit reached", { description: result.message });
      return;
    }
    setScript(result.script);
    toast.success("Your free basic script is ready.");
  };

  const resetLabel = usage?.resetAt
    ? new Date(usage.resetAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "after your first generation";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-[#26262b] bg-[#141417] p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#26262b] bg-[#09090b] px-3 py-1 text-xs font-medium text-[#9a9aa2]">
                <Sparkles className="h-3.5 w-3.5 text-[#06b6d4]" />
                Free for every Lumae account
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#f5f5f7]">Basic Script Generation</h1>
              <p className="mt-3 leading-relaxed text-[#9a9aa2]">
                Turn one idea into a concise generic script. This lightweight tool never uses credits and works for both free and paid users.
              </p>
            </div>
            <div className="rounded-xl border border-[#26262b] bg-[#09090b] px-4 py-3 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9a9aa2]">Free uses remaining</p>
              <p className="mt-1 text-2xl font-semibold text-[#f5f5f7]">{usage?.remaining ?? 3} <span className="text-sm font-medium text-[#9a9aa2]">/ 3</span></p>
              <p className="mt-1 text-xs text-[#9a9aa2]">Rolling 24-hour window</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-[#26262b] bg-[#141417] text-[#f5f5f7]">
            <CardHeader>
              <CardTitle>Start with one idea</CardTitle>
              <CardDescription className="text-[#9a9aa2]">Describe the point you want the short script to make. Generic text only—no platform optimisation or brand-voice controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={idea}
                onChange={(event) => setIdea(event.target.value.slice(0, MAX_IDEA_CHARS))}
                placeholder="Example: Explain why a small business should create a repeatable content workflow."
                className="min-h-44 border-[#26262b] bg-[#09090b] text-[#f5f5f7] placeholder:text-[#9a9aa2] focus-visible:ring-[#6366f1]"
                disabled={generate.isPending || usage?.remaining === 0}
              />
              <div className="flex items-center justify-between text-xs text-[#9a9aa2]">
                <span>{idea.length} / {MAX_IDEA_CHARS}</span>
                <span>Maximum 120 words</span>
              </div>
              <Button onClick={handleGenerate} disabled={generate.isPending || usage?.remaining === 0} className="lumae-gradient-cta w-full">
                <FileText className="mr-2 h-4 w-4" />
                {generate.isPending ? "Creating basic script…" : "Generate free basic script"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#26262b] bg-[#141417] text-[#f5f5f7]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-[#8b5cf6]" />Free vs. full AI Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-xl border border-[#26262b] bg-[#09090b] p-4">
                <p className="font-medium text-[#f5f5f7]">Basic Script Generation</p>
                <ul className="mt-2 space-y-1.5 text-[#9a9aa2]">
                  <li>• 3 successful generations per rolling 24 hours</li>
                  <li>• Up to 120 words of generic text</li>
                  <li>• No credits used</li>
                  <li>• Includes a Lumae free-tier attribution</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#6366f1]/40 bg-[#09090b] p-4">
                <p className="font-medium text-[#f5f5f7]">Full AI Generator</p>
                <p className="mt-2 text-[#9a9aa2]">Unlock brand voice, target audience, platform formatting, longer outputs, and complete content packages using credits.</p>
                <Button variant="outline" onClick={() => navigate("/content-studio/ai-generator")} className="mt-4 w-full border-[#6366f1]/50 bg-transparent text-[#f5f5f7] hover:bg-[#141417]">Use the full AI Generator</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {usage?.remaining === 0 && (
          <Card className="border-[#f59e0b]/40 bg-[#141417] text-[#f5f5f7]">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#f59e0b]" />
                <div><p className="font-medium">Your three free scripts are used.</p><p className="mt-1 text-sm text-[#9a9aa2]">Your next free use is available {resetLabel}. Continue now with the credit-powered AI Generator or add credits.</p></div>
              </div>
              <Button onClick={() => navigate("/billing/buy-credits")} className="lumae-gradient-cta shrink-0">View credit options</Button>
            </CardContent>
          </Card>
        )}

        {script && (
          <Card className="border-[#26262b] bg-[#141417] text-[#f5f5f7]">
            <CardHeader><CardTitle>Your basic script</CardTitle></CardHeader>
            <CardContent><pre className="whitespace-pre-wrap rounded-xl border border-[#26262b] bg-[#09090b] p-5 font-sans text-sm leading-relaxed text-[#f5f5f7]">{script}</pre></CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
