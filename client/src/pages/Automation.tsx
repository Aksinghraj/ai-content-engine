import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Plus, Trash2, ToggleRight, ToggleLeft } from "lucide-react";
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
      id,
      isActive: !isActive,
    });
  };

  const handleDeleteSchedule = (id: number) => {
    deleteMutation.mutate({ id });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            Content Automation
          </h1>
          <p className="text-slate-600">Schedule automatic content generation for your niches</p>
        </div>

        {/* Create New Schedule */}
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Schedule
          </Button>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Automation Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Schedule Name *
                  </label>
                  <Input
                    placeholder="e.g., Monday Tech Tips"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Niche *
                  </label>
                  <Input
                    placeholder="e.g., Technology, Marketing"
                    value={formData.niche}
                    onChange={(e) =>
                      setFormData({ ...formData, niche: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <Input
                    placeholder="e.g., Startup founders"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAudience: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Platform
                  </label>
                  <Select value={formData.platform} onValueChange={(value) =>
                    setFormData({ ...formData, platform: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Goal
                  </label>
                  <Select value={formData.goal} onValueChange={(value) =>
                    setFormData({ ...formData, goal: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="authority">Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Content Style
                  </label>
                  <Select value={formData.contentStyle} onValueChange={(value) =>
                    setFormData({ ...formData, contentStyle: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="entertaining">Entertaining</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Schedule (Cron Expression)
                </label>
                <Select value={formData.cronExpression} onValueChange={(value) =>
                  setFormData({ ...formData, cronExpression: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cronExpressions.map((expr) => (
                      <SelectItem key={expr.value} value={expr.value}>
                        {expr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddSchedule}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {createMutation.isPending ? "Creating..." : "Create Schedule"}
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedules List */}
        {isLoadingSchedules ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading schedules...</p>
          </div>
        ) : schedules.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Active Schedules</h2>
            {schedules.map((schedule: any) => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {schedule.name}
                        </h3>
                        {schedule.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Niche:</span> {schedule.niche}
                        </div>
                        <div>
                          <span className="font-medium">Platform:</span> {schedule.platform}
                        </div>
                        <div>
                          <span className="font-medium">Goal:</span> {schedule.goal}
                        </div>
                        <div>
                          <span className="font-medium">Style:</span> {schedule.contentStyle}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleSchedule(schedule.id, schedule.isActive)}
                        disabled={updateMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {schedule.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        disabled={deleteMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No automation schedules yet</p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
