import { getActiveAutomationSchedules, saveContentHistory, logAutomationExecution } from "../db";
import { generateContentPackage } from "./contentGenerator";
import * as cron from "node-cron";

interface ScheduledJob {
  scheduleId: number;
  task: cron.ScheduledTask;
}

const activeJobs = new Map<number, ScheduledJob>();

export async function initializeAutomationEngine() {
  console.log("[Automation Engine] Initializing...");
  
  try {
    const schedules = await getActiveAutomationSchedules();
    
    for (const schedule of schedules) {
      if (schedule.isActive) {
        scheduleAutomation(schedule);
      }
    }
    
    console.log(`[Automation Engine] Initialized with ${schedules.length} active schedules`);
  } catch (error) {
    console.error("[Automation Engine] Failed to initialize:", error);
  }
}

export function scheduleAutomation(schedule: any) {
  try {
    // Stop existing job if it exists
    if (activeJobs.has(schedule.id)) {
      const existingJob = activeJobs.get(schedule.id);
      if (existingJob) {
        existingJob.task.stop();
        activeJobs.delete(schedule.id);
      }
    }

    // Create new scheduled task
    const task = cron.schedule(schedule.cronExpression, async () => {
      await executeAutomation(schedule);
    });

    activeJobs.set(schedule.id, { scheduleId: schedule.id, task });
    console.log(`[Automation Engine] Scheduled task ${schedule.id}: ${schedule.name}`);
  } catch (error) {
    console.error(`[Automation Engine] Failed to schedule task ${schedule.id}:`, error);
  }
}

export function stopAutomation(scheduleId: number) {
  try {
    const job = activeJobs.get(scheduleId);
    if (job) {
      job.task.stop();
      activeJobs.delete(scheduleId);
      console.log(`[Automation Engine] Stopped task ${scheduleId}`);
    }
  } catch (error) {
    console.error(`[Automation Engine] Failed to stop task ${scheduleId}:`, error);
  }
}

async function executeAutomation(schedule: any) {
  console.log(`[Automation] Executing schedule: ${schedule.name} (ID: ${schedule.id})`);
  
  try {
    // Generate content using the schedule parameters
    const generatedContent = await generateContentPackage({
      niche: schedule.niche,
      targetAudience: schedule.targetAudience,
      platform: schedule.platform,
      goal: schedule.goal,
      contentStyle: schedule.contentStyle,
    });

    // Save to content history
    await saveContentHistory({
      userId: schedule.userId,
      niche: schedule.niche,
      targetAudience: schedule.targetAudience,
      platform: schedule.platform,
      goal: schedule.goal,
      contentStyle: schedule.contentStyle,
      generatedContent: generatedContent as any,
    });

    // Log execution success
    await logAutomationExecution(
      schedule.userId,
      schedule.id,
      'success',
      generatedContent
    );

    console.log(`[Automation] Successfully executed schedule: ${schedule.name}`);
    
    return {
      success: true,
      scheduleId: schedule.id,
      executedAt: new Date(),
    };
  } catch (error) {
    console.error(`[Automation] Failed to execute schedule ${schedule.id}:`, error);
    
    // Log execution failure
    await logAutomationExecution(
      schedule.userId,
      schedule.id,
      'failed',
      undefined,
      error instanceof Error ? error.message : "Unknown error"
    );
    
    return {
      success: false,
      scheduleId: schedule.id,
      error: error instanceof Error ? error.message : "Unknown error",
      executedAt: new Date(),
    };
  }
}

export function getActiveJobCount(): number {
  return activeJobs.size;
}

export function getJobStatus(scheduleId: number): boolean {
  return activeJobs.has(scheduleId);
}
