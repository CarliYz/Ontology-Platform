import { Request, Response, NextFunction } from "express";
import { prisma } from "../../src/lib/prisma.ts";

// const prisma = new PrismaClient();

export async function permissionMiddleware(req: Request, res: Response, next: NextFunction) {
  const actorId = req.headers["x-actor-id"] as string;
  const actorRole = req.headers["x-actor-role"] as string;

  // Global skip for non-API or read-only if we want, but user said "All global write interfaces go through permission check"
  // and "deny if no permission".
  
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  
  if (!isWrite) {
    return next();
  }

  // Determine resource
  let resource = "unknown";
  if (req.path.startsWith("/api/ontology")) resource = "ontology";
  if (req.path.startsWith("/api/actions")) resource = "action";
  if (req.path.startsWith("/api/apps")) resource = "app";
  if (req.path.startsWith("/api/governance")) resource = "governance";

  // Action mapping
  let action = "write";
  if (req.path.endsWith("/publish")) action = "publish";

  if (!actorId || !actorRole) {
    // If no actor info, and it's a write, we might require it.
    // For this prototype, if it's admin, we allow for now? 
    // Actually DoD says: "forbidden publish role returns PERMISSION_DENIED"
    if (actorRole === "ADMIN") return next();
    return res.status(403).json({ error: "PERMISSION_DENIED", message: "Actor info missing" });
  }

  try {
    const rule = await prisma.permissionRule.findFirst({
      where: {
        role: { name: actorRole },
        resource,
        action: { in: [action, "all"] },
        effect: "ALLOW"
      }
    });

    if (!rule && actorRole !== "ADMIN") {
      return res.status(403).json({ error: "PERMISSION_DENIED", message: `No permission for ${action} on ${resource}` });
    }

    next();
  } catch (err) {
    next(err);
  }
}
