import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2, Clock, ToggleRight, ToggleLeft, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Automation() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    niche: "",
    targetAudience: "",
    platform: "Instagram",
    goal: "growth",
    contentStyle: "educational",
    cronExpression: "0 0 * * MON",
  });

  // Fetch automation schedules
  const { data: schedulesData, isLoading: isLoadingSchedules, refetch } = trpc.automation.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.subscriptionTier === "pro",
  });

  // Mutations
  const createMutation = trpc.automation.create.useMutation({
    onSuccess: () => {
      toast.success("Automation schedule created!");
      setFormData({
        name: "",
        niche: "",
        targetAudience: "",
        platform: "Instagram",
        goal: "growth",
        contentStyle: "educational",
        cronExpression: "0 0 * * MON",
      });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create schedule");
    },
  });

  const updateMutation = trpc.automation.update.useMutation({
    onSuccess: () => {
      toast.success("Schedule updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });

  const deleteMutation = trpc.automation.delete.useMutation({
    onSuccess: () => {
      toast.success("Schedule deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete schedule");
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user?.subscriptionTier !== "pro") {
      toast.error("Automation is only available for Pro users");
      navigate("/pricing");
    }
  }, [isAuthenticated, user, navigate]);

  const handleAddSchedule = () => {
    if (!formData.name || !formData.niche) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleToggleSchedule = (id: number, isActive: boolean) => {
    updateMutation.mutate({
      id: id.toString(),
      isActive: !isActive,
    });
  };

  const handleDeleteSchedule = (id: number) => {
    deleteMutation.mutate({ id: id.toString() });
  };

  const cronExpressions = [
    { value: "0 0 * * MON", label: "Every Monday at midnight" },
    { value: "0 0 * * *", label: "Every day at midnight" },
    { value: "0 9 * * *", label: "Every day at 9 AM" },
    { value: "0 0 * * 0", label: "Every Sunday at midnight" },
    { value: "0 0 1 * *", label: "First day of every month" },
  ];

  if (!isAuthenticated || user?.subscriptionTier !== "pro") {
    return null;
  }

  const schedules = schedulesData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Content Automation
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Schedule Automatic Content Generation</h2>
          <p className="text-slate-400">Create automated schedules to generate content at specific times</p>
        </div>

        {/* Create New Schedule Button */}
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Schedule
          </Button>
        )}

        {/* Create Schedule Form */}
        {isCreating && (
          <Card className="mb-8 border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Create Automation Schedule</CardTitle>
              <CardDescription className="text-slate-400">Set up a new automated content generation schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Schedule Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Monday Tech Tips"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche" className="text-slate-300">Niche *</Label>
                  <Input
                    id="niche"
                    placeholder="e.g., Technology, Marketing"
                    value={formData.niche}
                    onChange={(e) =>
                      setFormData({ ...formData, niche: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-slate-300">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Startup founders"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAudience: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-slate-300">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) =>
                    setFormData({ ...formData, platform: value })
                  }>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-slate-300">Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) =>
                    setFormData({ ...formData, goal: value })
                  }>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="authority">Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="style" className="text-slate-300">Content Style</Label>
                  <Select value={formData.contentStyle} onValueChange={(value) =>
                    setFormData({ ...formData, contentStyle: value })
                  }>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="entertaining">Entertaining</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cron" className="text-slate-300">Schedule (Cron Expression)</Label>
                <Select value={formData.cronExpression} onValueChange={(value) =>
                  setFormData({ ...formData, cronExpression: value })
                }>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {cronExpressions.map((expr) => (
                      <SelectItem key={expr.value} value={expr.value}>
                        {expr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Cron: {formData.cronExpression}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddSchedule}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {createMutation.isPending ? "Creating..." : "Create Schedule"}
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedules List */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6">Active Schedules</h3>
          {isLoadingSchedules ? (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="py-12">
                <p className="text-center text-slate-400">Loading schedules...</p>
              </CardContent>
            </Card>
          ) : schedules.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="py-12">
                <p className="text-center text-slate-400">No automation schedules yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule: any) => (
                <Card key={schedule.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{schedule.name}</h4>
                          <Badge className={schedule.isActive ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-slate-700 text-slate-300"}>
                            {schedule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-slate-500">Niche</p>
                            <p className="text-sm text-slate-300">{schedule.niche}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Platform</p>
                            <p className="text-sm text-slate-300">{schedule.platform}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Goal</p>
                            <p className="text-sm text-slate-300 capitalize">{schedule.goal}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Schedule</p>
                            <p className="text-sm text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {schedule.cronExpression}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleToggleSchedule(schedule.id, schedule.isActive)}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          {schedule.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          variant="outline"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          className="border-red-600/50 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-12 border-slate-700 bg-gradient-to-br from-blue-900/20 to-slate-800/50 backdrop-blur-sm border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              How Automation Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p>• Schedules run automatically at the specified time using cron expressions</p>
            <p>• Generated content is saved to your content history automatically</p>
            <p>• You can view all generated content in the Generator page</p>
            <p>• Toggle schedules on/off without deleting them</p>
            <p>• Pro users get unlimited automation schedules</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
