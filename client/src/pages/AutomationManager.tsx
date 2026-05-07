import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Zap, Plus, Play, Pause, Trash2, Clock, CheckCircle, AlertCircle, Loader2, Calendar, BarChart3 } from "lucide-react";

export default function AutomationManager() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    niche: "",
    targetAudience: "",
    platform: "blog",
    goal: "",
    contentStyle: "",
    cronExpression: "0 9 * * *",
  });

  // Fetch automations
  const { data: automations, isLoading: automationsLoading, refetch: refetchAutomations } = trpc.automation.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch execution logs (using automation router)
  const { data: executionLogs, isLoading: logsLoading } = trpc.automation.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Create automation mutation
  const createAutomation = trpc.automation.create.useMutation({
    onSuccess: () => {
      refetchAutomations();
      setShowCreateForm(false);
      setNewAutomation({
        name: "",
        niche: "",
        targetAudience: "",
        platform: "blog",
        goal: "",
        contentStyle: "",
        cronExpression: "0 9 * * *",
      });
    },
  });

  // Update automation mutation
  const updateAutomation = trpc.automation.update.useMutation({
    onSuccess: () => {
      refetchAutomations();
    },
  });

  // Delete automation mutation
  const deleteAutomation = trpc.automation.delete.useMutation({
    onSuccess: () => {
      refetchAutomations();
    },
  });

  const handleCreateAutomation = async () => {
    if (!newAutomation.name || !newAutomation.niche || !newAutomation.platform) {
      alert("Please fill in all required fields");
      return;
    }

    createAutomation.mutate({
      name: newAutomation.name,
      niche: newAutomation.niche,
      targetAudience: newAutomation.targetAudience,
      platform: newAutomation.platform,
      goal: newAutomation.goal,
      contentStyle: newAutomation.contentStyle,
      cronExpression: newAutomation.cronExpression,
    });
  };

  const handleToggleAutomation = (automation: any) => {
    updateAutomation.mutate({
      id: automation.id,
      isActive: !automation.isActive,
    });
  };

  const handleDeleteAutomation = (id: number) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteAutomation.mutate({ id: id.toString() });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="border-slate-700 bg-slate-800/50 p-8 text-center">
          <p className="text-slate-300 mb-4">Please log in to manage automations</p>
          <Button onClick={() => navigate("/login")} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const activeCount = automations?.data?.filter(a => a.isActive).length || 0;
  const totalCount = automations?.data?.length || 0;
  const isFreeUser = user?.subscriptionTier === "free";
  const automationLimit = isFreeUser ? 3 : null;
  const isAtLimit = isFreeUser && totalCount >= 3;
  const createError = createAutomation.error?.message || "";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Automation Manager</h1>
                <p className="text-slate-400">Create and manage your content automation schedules</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={isAtLimit}
              className={`font-semibold ${
                isAtLimit
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Automation
            </Button>
          </div>

          {/* Free Tier Limit Alert */}
          {isFreeUser && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-semibold mb-1">Free Tier: {totalCount}/3 Automations Used</p>
                  <p className="text-blue-300 text-sm">You have {3 - totalCount} automation{3 - totalCount !== 1 ? 's' : ''} remaining</p>
                </div>
                {isAtLimit && (
                  <Button
                    onClick={() => navigate("/payments")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="border-border bg-card/50 p-4">
              <p className="text-muted-foreground text-sm mb-1">Total Automations</p>
              <p className="text-3xl font-bold text-foreground">{totalCount}</p>
            </Card>
            <Card className="border-border bg-card/50 p-4">
              <p className="text-muted-foreground text-sm mb-1">Active</p>
              <p className="text-3xl font-bold text-green-400">{activeCount}</p>
            </Card>
            <Card className="border-border bg-card/50 p-4">
              <p className="text-muted-foreground text-sm mb-1">Paused</p>
              <p className="text-3xl font-bold text-yellow-400">{totalCount - activeCount}</p>
            </Card>
          </div>
        </div>

        {/* Error Message */}
        {createError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-semibold">{createError}</p>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border-border bg-card/50 backdrop-blur-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Automation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Automation Name</label>
                <Input
                  placeholder="e.g., Daily Tech Blog"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Platform</label>
                <select
                  value={newAutomation.platform}
                  onChange={(e) => setNewAutomation({ ...newAutomation, platform: e.target.value })}
                  className="w-full bg-background border border-border text-foreground rounded-md p-2"
                >
                  <option value="blog">Blog Post</option>
                  <option value="twitter">Twitter</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Target Audience</label>
                <Input
                  placeholder="e.g., Developers, Marketers"
                  value={newAutomation.targetAudience}
                  onChange={(e) => setNewAutomation({ ...newAutomation, targetAudience: e.target.value })}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Niche/Industry</label>
                <Input
                  placeholder="e.g., Technology, Finance"
                  value={newAutomation.niche}
                  onChange={(e) => setNewAutomation({ ...newAutomation, niche: e.target.value })}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Goal</label>
                <Input
                  placeholder="e.g., Drive engagement, Generate leads"
                  value={newAutomation.goal}
                  onChange={(e) => setNewAutomation({ ...newAutomation, goal: e.target.value })}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Content Style</label>
                <Input
                  placeholder="e.g., Educational, Entertaining"
                  value={newAutomation.contentStyle}
                  onChange={(e) => setNewAutomation({ ...newAutomation, contentStyle: e.target.value })}
                  className="bg-background border-border text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleCreateAutomation}
                disabled={createAutomation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
              >
                {createAutomation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Automation
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Automations List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Automations</h2>

          {automationsLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : automations?.data && automations.data.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {automations.data.map((automation: any) => (
                <Card key={automation.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6 hover:border-purple-500 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{automation.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          automation.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {automation.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm capitalize">{automation.platform} • {automation.goal}</p>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                    <p className="text-slate-400 text-xs mb-2">Configuration</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300"><span className="text-slate-500">Niche:</span> {automation.niche}</p>
                      <p className="text-slate-300"><span className="text-slate-500">Audience:</span> {automation.targetAudience}</p>
                      <p className="text-slate-300"><span className="text-slate-500">Style:</span> {automation.contentStyle}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleAutomation(automation)}
                      disabled={updateAutomation.isPending}
                      className={`flex-1 ${
                        automation.isActive
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-semibold`}
                    >
                      {automation.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDeleteAutomation(automation.id)}
                      disabled={deleteAutomation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-700 bg-slate-800/50 p-12 text-center">
              <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No automations yet. Create one to get started!</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Automation
              </Button>
            </Card>
          )}
        </div>

        {/* Execution Logs */}
        {executionLogs?.data && executionLogs.data.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Recent Executions
            </h2>

            {logsLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {executionLogs.data.slice(0, 10).map((log: any) => (
                  <Card key={log.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.status === "success" ? "bg-green-500/20" : "bg-red-500/20"
                        }`}>
                          {log.status === "success" ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{log.status}</p>
                          <p className="text-slate-400 text-sm">{log.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(log.executedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
