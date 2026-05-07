import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Play, Pause, Trash2, Plus, Clock, CheckCircle, AlertCircle, Eye, Loader2 } from "lucide-react";

export default function AutomationDashboardNew() {
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch automation schedules
  const { data: schedulesResponse, isLoading: schedulesLoading, refetch: refetchSchedules } = trpc.automation.list.useQuery(
    undefined,
    { enabled: user?.subscriptionTier === "pro" }
  );

  // Fetch execution logs
  const { data: logsResponse, isLoading: logsLoading } = trpc.analytics.getExecutionLogs.useQuery(
    { limit: 100 },
    { enabled: user?.subscriptionTier === "pro" }
  );

  // Update automation mutation (for pause/resume)
  const updateAutomation = trpc.automation.update.useMutation({
    onSuccess: () => {
      refetchSchedules();
    },
    onError: (error) => {
      console.error("Error updating automation:", error);
    },
  });

  // Delete automation mutation
  const deleteAutomation = trpc.automation.delete.useMutation({
    onSuccess: () => {
      refetchSchedules();
      setSelectedSchedule(null);
    },
    onError: (error) => {
      console.error("Error deleting automation:", error);
    },
  });

  // Set up polling for real-time updates
  useEffect(() => {
    if (user?.subscriptionTier === "pro") {
      // Initial fetch
      refetchSchedules();

      // Set up polling every 30 seconds
      const interval = setInterval(() => {
        refetchSchedules();
      }, 30000);

      setPollInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user?.subscriptionTier]);

  if (user?.subscriptionTier !== "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-purple-500/20 p-8 text-center">
            <Eye className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pro Feature</h2>
            <p className="text-slate-300 mb-6">Automation dashboard is only available for Pro users. Upgrade now to manage your automations!</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Upgrade to Pro
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isLoading = schedulesLoading || logsLoading;
  const schedules = schedulesResponse?.data || [];
  const executionLogs = logsResponse?.data || [];

  // Get logs for selected schedule
  const selectedLogs = selectedSchedule
    ? executionLogs.filter((log: any) => log.scheduleId === selectedSchedule)
    : [];

  const handlePauseResume = (scheduleId: number, currentStatus: boolean) => {
    updateAutomation.mutate({
      id: scheduleId.toString(),
      isActive: !currentStatus,
    });
  };

  const handleDelete = (scheduleId: number) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteAutomation.mutate({ id: scheduleId.toString() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Automation Dashboard</h1>
            <p className="text-slate-300">Manage and monitor your scheduled content automations</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Automation
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Automations List */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Active Automations</h2>
                
                {schedules && schedules.length > 0 ? (
                  <div className="space-y-3">
                    {schedules.map((schedule: any) => (
                      <div
                        key={schedule.id}
                        onClick={() => setSelectedSchedule(schedule.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedSchedule === schedule.id
                            ? "bg-purple-600/30 border-purple-500 border"
                            : "bg-slate-700/50 border-slate-600 border hover:border-purple-500"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-semibold">{schedule.name}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                schedule.isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}>
                                {schedule.isActive ? "ACTIVE" : "PAUSED"}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-2">{schedule.description || "No description"}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {schedule.cronExpression}
                              </span>
                              <span>Platform: {schedule.platform}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePauseResume(schedule.id, schedule.isActive);
                              }}
                              disabled={updateAutomation.isPending}
                              className={schedule.isActive 
                                ? "text-yellow-400 border-yellow-400 hover:bg-yellow-400/10" 
                                : "text-green-400 border-green-400 hover:bg-green-400/10"
                              }
                            >
                              {schedule.isActive ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(schedule.id);
                              }}
                              disabled={deleteAutomation.isPending}
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-4">No automations created yet</p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Create Your First Automation
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Execution Logs Sidebar */}
            <div>
              <Card className="bg-slate-800/50 border-purple-500/20 p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {selectedSchedule ? "Execution Logs" : "Recent Activity"}
                </h2>

                {selectedSchedule ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedLogs && selectedLogs.length > 0 ? (
                      selectedLogs.map((log: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-start gap-2 mb-1">
                            {log.status === "success" ? (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                {log.status === "success" ? "Success" : "Failed"}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {new Date(log.executedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {log.errorMessage && (
                            <p className="text-red-400 text-xs mt-2 p-2 bg-red-500/10 rounded">
                              {log.errorMessage}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No logs available</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {executionLogs && executionLogs.length > 0 ? (
                      executionLogs.slice(0, 10).map((log: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-start gap-2 mb-1">
                            {log.status === "success" ? (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                Schedule #{log.scheduleId}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {new Date(log.executedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No recent activity</p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Statistics */}
        {!isLoading && schedules && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-slate-800/50 border-purple-500/20 p-6">
              <p className="text-slate-400 text-sm mb-1">Total Automations</p>
              <p className="text-3xl font-bold text-white">{schedules.length}</p>
            </Card>
            <Card className="bg-slate-800/50 border-purple-500/20 p-6">
              <p className="text-slate-400 text-sm mb-1">Active</p>
              <p className="text-3xl font-bold text-green-400">
                {schedules.filter((s: any) => s.isActive).length}
              </p>
            </Card>
            <Card className="bg-slate-800/50 border-purple-500/20 p-6">
              <p className="text-slate-400 text-sm mb-1">Paused</p>
              <p className="text-3xl font-bold text-yellow-400">
                {schedules.filter((s: any) => !s.isActive).length}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
