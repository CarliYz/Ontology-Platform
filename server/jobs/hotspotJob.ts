import { prisma } from "../../src/lib/prisma.ts";

// const prisma = new PrismaClient(); // Removed to use singleton

/**
 * Periodically aggregate query events into hotspot snapshots
 */
export function startHotspotJob() {
  console.log("[HotspotJob] Initialized.");
  
  // Run every 5 minutes for demo purposes (usually longer)
  setInterval(async () => {
    try {
      await generateSnapshots();
    } catch (err) {
      console.error("[HotspotJob] Generation failed", err);
    }
  }, 5 * 60 * 1000);

  // Initial run
  generateSnapshots();
}

async function generateSnapshots() {
  console.log("[HotspotJob] Generating hotspots...");
  
  const windows = [
    { label: '1h', duration: 1 * 60 * 60 * 1000 },
    { label: '24h', duration: 24 * 60 * 60 * 1000 },
    { label: '7d', duration: 7 * 24 * 60 * 60 * 1000 }
  ];

  for (const win of windows) {
    const since = new Date(Date.now() - win.duration);
    
    // Aggregate hit counts per targetRef
    const counts = await prisma.queryEvent.groupBy({
      by: ['targetRef'],
      where: {
        createdAt: { gte: since },
        targetRef: { not: null }
      },
      _count: {
        _all: true
      },
      _avg: {
        durationMs: true
      }
    });

    // Clear old snapshots for this window
    await prisma.hotspotSnapshot.deleteMany({
      where: { window: win.label }
    });

    // Create new ones
    for (const item of counts) {
      if (!item.targetRef) continue;
      
      const intensity = (item._count._all * 10.0); // Simplified intensity score

      await prisma.hotspotSnapshot.create({
        data: {
          window: win.label,
          targetRef: item.targetRef,
          hitCount: item._count._all,
          intensity: intensity,
          createdAt: new Date()
        }
      });
    }
  }
  
  console.log("[HotspotJob] Snapshots updated.");
}
