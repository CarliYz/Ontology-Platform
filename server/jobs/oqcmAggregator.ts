import { prisma } from "../../src/lib/prisma.ts";

// const prisma = new PrismaClient();

export async function aggregateUsage() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // Aggregate queries
    const queryStats = await prisma.queryEvent.aggregate({
        _count: true,
        _sum: { durationMs: true },
        where: { createdAt: { gt: oneHourAgo } }
    });

    // Aggregate runs
    const runStats = await prisma.run.aggregate({
        _count: true,
        where: { createdAt: { gt: oneHourAgo } }
    });

    // Write cost record
    if (queryStats._count > 0 || runStats._count > 0) {
        await prisma.costRecord.create({
            data: {
                window: "1h",
                computeSecs: ((queryStats._sum.durationMs || 0) / 1000) + (runStats._count * 0.5), // Arbitrary cost
                queryCount: queryStats._count,
                category: "Usage Batch"
            }
        });
    }
}

export function startOqcmAggregator() {
    setInterval(aggregateUsage, 3600000); // Hourly
}
