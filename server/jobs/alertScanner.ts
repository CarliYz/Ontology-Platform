import { prisma } from "../../src/lib/prisma.ts";

// const prisma = new PrismaClient();

export async function scanForAlerts() {
  const rules = await prisma.alertRule.findMany({ where: { enabled: true } });
  
  for (const rule of rules) {
    if (rule.category === "PERFORMANCE") {
        // High latency queries
        const slowQueries = await prisma.queryEvent.findMany({
            where: {
                durationMs: { gt: 1000 }, // Example hardcoded or parse rule.threshold
                createdAt: { gt: new Date(Date.now() - 60000) } // Last minute
            }
        });

        for (const q of slowQueries) {
            await prisma.alertEvent.create({
                data: {
                    ruleId: rule.id,
                    sourceType: "QUERY",
                    sourceId: q.id,
                    message: `Slow query detected: ${q.durationMs}ms`,
                    severity: rule.severity
                }
            });
        }
    }
    
    if (rule.category === "SECURITY") {
        // Many failed runs maybe?
        const failedRuns = await prisma.run.findMany({
            where: {
                status: "failed",
                createdAt: { gt: new Date(Date.now() - 60000) }
            }
        });
        
        if (failedRuns.length > 5) {
            await prisma.alertEvent.create({
                data: {
                    ruleId: rule.id,
                    sourceType: "RUN",
                    sourceId: "BATCH",
                    message: `High failure rate: ${failedRuns.length} runs failed in last minute`,
                    severity: rule.severity
                }
            });
        }
    }
  }
}

export function startAlertScanner() {
    setInterval(scanForAlerts, 60000);
}
