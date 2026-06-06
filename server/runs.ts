import { prisma } from "../src/lib/prisma.ts";
import { RunStatus, isValidRunTransition } from "../src/lib/status.ts";

// const prisma = new PrismaClient(); // Removed to use singleton

// In-memory interval tracking or simplified queue
class RunManager {
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();

  async enqueue(runId: string) {
    console.log(`[RunManager] Enqueuing run: ${runId}`);
    // Start execution simulation
    this.execute(runId);
  }

  private async execute(runId: string) {
    const run = await prisma.run.findUnique({ 
      where: { id: runId },
      include: { action: true }
    });

    if (!run || run.status !== RunStatus.QUEUED) return;

    // Transition to RUNNING
    await this.updateStatus(runId, RunStatus.RUNNING);

    // Initial log/step
    await prisma.runStep.create({
      data: {
        runId,
        name: "Initialization",
        status: "COMPLETED",
        logs: "Starting action execution sequence."
      }
    });

    // Simulate work with setTimeout
    const timeout = setTimeout(async () => {
      try {
        // Fetch current run to check if it was canceled
        const currentRun = await prisma.run.findUnique({ where: { id: runId } });
        if (currentRun?.status === RunStatus.CANCELED) {
          console.log(`[RunManager] Run ${runId} was canceled before completion.`);
          return;
        }

        // Logic simulation step
        await prisma.runStep.create({
          data: {
            runId,
            name: "Logic Execution",
            status: "COMPLETED",
            logs: `Executing script for ${run.action.apiName}...`
          }
        });

        // Finalize success
        await this.updateStatus(runId, RunStatus.SUCCEEDED, { 
          output: JSON.stringify({ result: "Success", timestamp: new Date().toISOString() }) 
        });
        
        await prisma.runStep.create({
          data: {
            runId,
            name: "Finalization",
            status: "COMPLETED",
            logs: "Execution finished successfully."
          }
        });

      } catch (err: any) {
        await this.updateStatus(runId, RunStatus.FAILED, { error: err.message });
      } finally {
        this.activeIntervals.delete(runId);
      }
    }, 5000); // 5 second simulation

    this.activeIntervals.set(runId, timeout);
  }

  async cancel(runId: string) {
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run || !isValidRunTransition(run.status, RunStatus.CANCELED)) {
      throw new Error("Cannot cancel run in current state");
    }

    const timeout = this.activeIntervals.get(runId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeIntervals.delete(runId);
    }

    await this.updateStatus(runId, RunStatus.CANCELED);
    await prisma.runStep.create({
      data: {
        runId,
        name: "Cancellation",
        status: "CANCELED",
        logs: "Run manually canceled by operator."
      }
    });
  }

  private async updateStatus(runId: string, status: RunStatus, extra: any = {}) {
    await prisma.run.update({
      where: { id: runId },
      data: { 
        status,
        ...extra,
        updatedAt: new Date()
      }
    });
    console.log(`[RunManager] Run ${runId} status -> ${status}`);
  }
}

export const runManager = new RunManager();
