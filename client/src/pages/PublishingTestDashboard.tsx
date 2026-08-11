import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";

interface TestResult {
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  duration?: number;
  timestamp?: string;
}

interface PhaseResult {
  phase: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  passRate: number;
}

export default function PublishingTestDashboard() {
  const [phases, setPhases] = useState<PhaseResult[]>([
    {
      phase: "Phase 1: Single Platform Publishing",
      tests: [
        { name: "Instagram Publishing", status: "pending" },
        { name: "Facebook Publishing", status: "pending" },
        { name: "Twitter Publishing", status: "pending" },
        { name: "LinkedIn Publishing", status: "pending" },
        { name: "YouTube Publishing", status: "pending" },
        { name: "TikTok Publishing", status: "pending" },
      ],
      passed: 0,
      failed: 0,
      passRate: 0,
    },
    {
      phase: "Phase 2: Multi-Platform Publishing",
      tests: [
        { name: "Publish to 3 Platforms", status: "pending" },
        { name: "Publish to All 6 Platforms", status: "pending" },
      ],
      passed: 0,
      failed: 0,
      passRate: 0,
    },
    {
      phase: "Phase 3: Character Limit Validation",
      tests: [
        { name: "Twitter 280 Char Limit", status: "pending" },
        { name: "Instagram 2200 Char Limit", status: "pending" },
      ],
      passed: 0,
      failed: 0,
      passRate: 0,
    },
    {
      phase: "Phase 4: Media Upload Testing",
      tests: [
        { name: "Single Image Upload", status: "pending" },
        { name: "Multiple Image Upload", status: "pending" },
        { name: "Large Image Upload", status: "pending" },
        { name: "Video Upload", status: "pending" },
      ],
      passed: 0,
      failed: 0,
      passRate: 0,
    },
    {
      phase: "Phase 5: Error Handling",
      tests: [
        { name: "Publish Without Content", status: "pending" },
        { name: "Publish Without Platform", status: "pending" },
        { name: "Publish to Disconnected Account", status: "pending" },
      ],
      passed: 0,
      failed: 0,
      passRate: 0,
    },
  ]);

  const [overallStats, setOverallStats] = useState({
    totalTests: 21,
    passed: 0,
    failed: 0,
    passRate: 0,
    startTime: null as Date | null,
    endTime: null as Date | null,
  });

  const updateTestResult = (
    phaseIndex: number,
    testIndex: number,
    status: "passed" | "failed"
  ) => {
    const newPhases = [...phases];
    newPhases[phaseIndex].tests[testIndex].status = status;
    newPhases[phaseIndex].tests[testIndex].timestamp = new Date().toISOString();
    newPhases[phaseIndex].tests[testIndex].duration = Math.random() * 30 + 5; // Mock duration

    // Recalculate phase stats
    const passed = newPhases[phaseIndex].tests.filter(
      (t) => t.status === "passed"
    ).length;
    const failed = newPhases[phaseIndex].tests.filter(
      (t) => t.status === "failed"
    ).length;
    newPhases[phaseIndex].passed = passed;
    newPhases[phaseIndex].failed = failed;
    newPhases[phaseIndex].passRate =
      ((passed / newPhases[phaseIndex].tests.length) * 100) | 0;

    setPhases(newPhases);

    // Recalculate overall stats
    let totalPassed = 0;
    let totalFailed = 0;
    newPhases.forEach((phase) => {
      totalPassed += phase.passed;
      totalFailed += phase.failed;
    });

    setOverallStats({
      ...overallStats,
      passed: totalPassed,
      failed: totalFailed,
      passRate: ((totalPassed / overallStats.totalTests) * 100) | 0,
    });
  };

  const startTestSuite = () => {
    setOverallStats({
      ...overallStats,
      startTime: new Date(),
    });
  };

  const completeTestSuite = () => {
    setOverallStats({
      ...overallStats,
      endTime: new Date(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "running":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      case "running":
        return <Activity className="w-4 h-4 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Social Publishing Test Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Track and verify social media publishing functionality across all
            platforms
          </p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tests</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {overallStats.totalTests}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Passed</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {overallStats.passed}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-3xl font-bold text-red-400 mt-2">
                  {overallStats.failed}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pass Rate</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">
                  {overallStats.passRate}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Test Phases */}
        <div className="space-y-4">
          {phases.map((phase, phaseIndex) => (
            <Card key={phaseIndex} className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {phase.phase}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {phase.passed} passed, {phase.failed} failed ({phase.passRate}
                    %)
                  </p>
                </div>
                <Badge
                  className={`${
                    phase.passRate === 100
                      ? "bg-green-500/20 text-green-400"
                      : phase.passRate >= 50
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {phase.passRate}%
                </Badge>
              </div>

              <div className="space-y-2">
                {phase.tests.map((test, testIndex) => (
                  <div
                    key={testIndex}
                    className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="text-sm text-white">{test.name}</p>
                        {test.duration && (
                          <p className="text-xs text-gray-400">
                            {test.duration.toFixed(1)}s
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTestResult(phaseIndex, testIndex, "passed")
                        }
                        className={`${
                          test.status === "passed"
                            ? "bg-green-500/20 border-green-500 text-green-400"
                            : ""
                        }`}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTestResult(phaseIndex, testIndex, "failed")
                        }
                        className={`${
                          test.status === "failed"
                            ? "bg-red-500/20 border-red-500 text-red-400"
                            : ""
                        }`}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={startTestSuite}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Start Test Suite
          </Button>
          <Button
            onClick={completeTestSuite}
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
          >
            Complete Test Suite
          </Button>
        </div>

        {/* Deployment Readiness */}
        {overallStats.passed + overallStats.failed > 0 && (
          <Card
            className={`${
              overallStats.passRate >= 95
                ? "bg-green-500/10 border-green-500/30"
                : "bg-yellow-500/10 border-yellow-500/30"
            } p-6`}
          >
            <div className="flex gap-4">
              {overallStats.passRate >= 95 ? (
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              )}
              <div>
                <h3
                  className={`font-semibold ${
                    overallStats.passRate >= 95
                      ? "text-green-200"
                      : "text-yellow-200"
                  }`}
                >
                  {overallStats.passRate >= 95
                    ? "✅ Ready for Production"
                    : "⚠️ Review Required"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    overallStats.passRate >= 95
                      ? "text-green-100"
                      : "text-yellow-100"
                  }`}
                >
                  {overallStats.passRate >= 95
                    ? `All tests passed with ${overallStats.passRate}% success rate. The social publishing feature is ready for production deployment.`
                    : `Current pass rate is ${overallStats.passRate}%. Aim for 95%+ before production deployment.`}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
