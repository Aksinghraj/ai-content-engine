import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Zap, Clock, AlertCircle } from "lucide-react";

export function SimpleAutomation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    niche: "",
    targetAudience: "",
    platform: "twitter",
    goal: "",
    contentStyle: "engaging",
    cronExpression: "0 9 * * *",
  });

  const createMutation = trpc.automation.create.useMutation();
  const listQuery = trpc.automation.list.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background p-4 flex items-center justify-center">
        <Card className="p-8 text-center border-border">
          <p className="text-foreground mb-4">Please log in to create automations</p>
          <Button onClick={() => setLocation("/login")} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const automationCount = listQuery.data?.automationCount || 0;
  const freeAutomationsRemaining = listQuery.data?.freeAutomationsRemaining || 3;
  const subscriptionTier = user?.subscriptionTier || "free";
  const isFreeUser = subscriptionTier === "free";
  const canCreateMore = isFreeUser ? freeAutomationsRemaining > 0 : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateMore) {
      alert("You've reached your free automation limit. Upgrade to Pro for more.");
      return;
    }
    createMutation.mutate(formData, {
      onSuccess: () => {
        alert("✅ Automation created successfully!");
        setFormData({
          name: "",
          niche: "",
          targetAudience: "",
          platform: "twitter",
          goal: "",
          contentStyle: "engaging",
          cronExpression: "0 9 * * *",
        });
        listQuery.refetch();
      },
      onError: (error: any) => {
        alert(`❌ Error: ${error.message}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-500" />
            Create Automation
          </h1>
          <p className="text-muted-foreground">Set up automated content generation for your social media</p>
        </div>

        {/* Free Automations Status */}
        <Card className="border-border bg-card/50 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">
                {isFreeUser ? `${freeAutomationsRemaining} Free Automations Remaining` : "Pro Plan - Unlimited Automations"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isFreeUser
                  ? `You have ${freeAutomationsRemaining} free automations left. After that, each automation costs 10 credits.`
                  : "You have unlimited automations with your Pro plan."}
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="border-border bg-card/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Automation Name *</label>
              <Input
                required
                placeholder="e.g., Daily Twitter Tips"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Niche/Topic *</label>
              <Input
                required
                placeholder="e.g., Web Development, Marketing, AI"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Target Audience *</label>
              <Input
                required
                placeholder="e.g., Developers, Entrepreneurs, Students"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Platform *</label>
              <select
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Goal *</label>
              <Input
                required
                placeholder="e.g., Increase engagement, Build audience, Share insights"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content Style *</label>
              <select
                required
                value={formData.contentStyle}
                onChange={(e) => setFormData({ ...formData, contentStyle: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                <option value="engaging">Engaging & Fun</option>
                <option value="professional">Professional</option>
                <option value="educational">Educational</option>
                <option value="inspirational">Inspirational</option>
                <option value="viral">Viral & Trending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule (Cron Expression)
              </label>
              <select
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                <option value="0 9 * * *">Every day at 9 AM</option>
                <option value="0 12 * * *">Every day at 12 PM</option>
                <option value="0 18 * * *">Every day at 6 PM</option>
                <option value="0 9 * * MON">Every Monday at 9 AM</option>
                <option value="0 9 * * 1-5">Weekdays at 9 AM</option>
                <option value="0 0 * * *">Every day at midnight</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || !canCreateMore}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : `Create Automation (${freeAutomationsRemaining} Free Left)`}
            </Button>

            {!canCreateMore && (
              <Button
                type="button"
                onClick={() => setLocation("/credits")}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 rounded-lg"
              >
                Buy Credits to Create More
              </Button>
            )}
          </form>
        </Card>

        {/* Active Automations */}
        {listQuery.data?.data && listQuery.data.data.length > 0 && (
          <Card className="border-border bg-card/50 p-6 mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Automations ({automationCount})</h2>
            <div className="space-y-3">
              {listQuery.data.data.map((automation: any) => (
                <div key={automation.id} className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <p className="font-semibold text-foreground">{automation.name}</p>
                  <p className="text-sm text-muted-foreground">Platform: {automation.platform}</p>
                  <p className="text-sm text-muted-foreground">Status: {automation.isActive ? "🟢 Active" : "⚫ Paused"}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
