import { Request, Response, NextFunction } from "express";
import { prisma } from "../../src/lib/prisma.ts";
import { v4 as uuidv4 } from "uuid";

// const prisma = new PrismaClient();

/**
 * Middleware to log analytics for all read requests
 */
export async function queryLogger(req: Request, res: Response, next: NextFunction) {
  // Only log read / query requests
  if (req.method !== 'GET' || !req.path.startsWith('/api')) {
    return next();
  }

  const start = Date.now();
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

  // Capture the original end function
  const oldJson = res.json;
  res.json = function (data: any) {
    const durationMs = Date.now() - start;
    
    // Fire and forget logging
    logQueryEvent(req, data, durationMs, traceId).catch(err => {
      console.error("Failed to log query event", err);
    });

    return oldJson.apply(res, arguments as any);
  };

  next();
}

async function logQueryEvent(req: Request, data: any, durationMs: number, traceId: string) {
  // Determine query type and target from path
  const path = req.path;
  let queryType = 'OTHER';
  let targetRef = null;

  if (path.includes('/ontologies')) queryType = 'ONTOLOGY_READ';
  if (path.includes('/object-types')) queryType = 'OBJECT_TYPE_READ';
  if (path.includes('/actions')) queryType = 'ACTION_READ';
  if (path.includes('/runs')) queryType = 'RUN_READ';

  // Count results
  let resultCount = 0;
  if (Array.isArray(data)) {
    resultCount = data.length;
  } else if (data && typeof data === 'object') {
    resultCount = 1;
  }

  await prisma.queryEvent.create({
    data: {
      queryType,
      targetRef: (req.params.id as string) || null,
      parameters: JSON.stringify({
         query: req.query,
         params: req.params,
         path: req.path
      }),
      durationMs,
      resultCount,
      actorId: 'admin', // In real app, from auth
      traceId
    }
  });
}
