import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { prisma } from "./src/lib/prisma.ts";
import { v4 as uuidv4 } from "uuid";
import { runManager } from "./server/runs.ts";
import { queryLogger } from "./server/middleware/queryLogger.ts";
import { startHotspotJob } from "./server/jobs/hotspotJob.ts";
import { permissionMiddleware } from "./server/middleware/permission.ts";
import { startAlertScanner } from "./server/jobs/alertScanner.ts";
import { startOqcmAggregator } from "./server/jobs/oqcmAggregator.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const prisma = new PrismaClient(); // Removed to use singleton

// Error codes
const ERR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  VERSION_MISMATCH: "VERSION_MISMATCH",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR"
};

// Error Handler helper
const sendError = (res: express.Response, code: string, message: string, status = 400, details = null) => {
  const traceId = uuidv4();
  console.error(`[${traceId}] Order Error: ${code} - ${message}`, details);
  res.status(status).json({
    error: { code, message, details, traceId }
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(permissionMiddleware);
  app.use(queryLogger);

  // Start background jobs
  startHotspotJob();
  startAlertScanner();
  startOqcmAggregator();

  // Audit Middleware
  app.use(async (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const originalJson = res.json;
      const traceId = uuidv4();
      const actorId = req.headers['x-actor-id'] as string || 'admin';

      res.json = function(data) {
        // Asynchronously log audit
        prisma.auditLog.create({
          data: {
            actorId,
            action: `${req.method} ${req.path}`,
            entityId: req.params.id || null,
            traceId,
            payload: JSON.stringify({ body: req.body, response: data })
          }
        }).catch(err => console.error("Audit Log Error:", err));
        
        return originalJson.call(this, data);
      };
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  async function markOntologyAsDraft(ontologyId: string | undefined) {
    if (!ontologyId) return;
    try {
      await prisma.ontology.update({
        where: { id: ontologyId },
        data: { status: 'draft' }
      });
    } catch (err) {
      console.error("Failed to mark ontology as draft", err);
    }
  }

  // --- Analysis Routes ---
  // ... (previous routes)

  // --- App Domain Routes ---

  app.get("/api/apps", async (req, res) => {
    try {
      const apps = await prisma.app.findMany({
        include: { pages: true, navItems: true },
        orderBy: { updatedAt: "desc" }
      });
      res.json(apps);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch apps");
    }
  });

  app.post("/api/apps", async (req, res) => {
    const { name, description, icon } = req.body;
    try {
      const app = await prisma.app.create({
        data: { name, description, icon }
      });
      res.status(201).json(app);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create app");
    }
  });

  app.get("/api/apps/:id", async (req, res) => {
    try {
      const application = await prisma.app.findUnique({
        where: { id: req.params.id },
        include: { 
          pages: { include: { bindings: true } }, 
          navItems: true 
        }
      });
      if (!application) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "App not found");
      res.json(application);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch app");
    }
  });

  app.patch("/api/apps/:id", async (req, res) => {
    const { name, description, icon, status } = req.body;
    try {
      const application = await prisma.app.update({
        where: { id: req.params.id },
        data: { name, description, icon, status }
      });
      res.json(application);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to update app");
    }
  });

  app.delete("/api/apps/:id", async (req, res) => {
    try {
      // Cascade delete is handled by app logic or prisma schema
      await prisma.pageBinding.deleteMany({ where: { page: { appId: req.params.id } } });
      await prisma.appPage.deleteMany({ where: { appId: req.params.id } });
      await prisma.appNavItem.deleteMany({ where: { appId: req.params.id } });
      await prisma.app.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to delete app");
    }
  });

  app.post("/api/apps/:id/pages", async (req, res) => {
    const { name, type, config, bindings } = req.body;
    try {
      const page = await prisma.appPage.create({
        data: {
          appId: req.params.id,
          name,
          type,
          config: JSON.stringify(config || {}),
          bindings: {
            create: (bindings || []).map((b: any) => ({
              refType: b.refType,
              refId: b.refId,
              slotName: b.slotName
            }))
          }
        },
        include: { bindings: true }
      });
      res.status(201).json(page);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create page");
    }
  });

  app.get("/api/apps/:id/pages", async (req, res) => {
    try {
      const pages = await prisma.appPage.findMany({
        where: { appId: req.params.id },
        include: { bindings: true }
      });
      res.json(pages);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch pages");
    }
  });

  app.post("/api/apps/:id/nav", async (req, res) => {
    const { label, icon, targetPageId, parentId, order } = req.body;
    try {
      const navItem = await prisma.appNavItem.create({
        data: {
          appId: req.params.id,
          label,
          icon,
          targetPageId,
          parentId,
          order: order || 0
        }
      });
      res.status(201).json(navItem);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create nav item");
    }
  });

  app.get("/api/apps/:id/nav", async (req, res) => {
    try {
      const items = await prisma.appNavItem.findMany({
        where: { appId: req.params.id },
        orderBy: { order: "asc" }
      });
      res.json(items);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch nav items");
    }
  });

  // --- Governance Routes ---

  app.get("/api/governance/roles", async (req, res) => {
    try {
      const roles = await prisma.role.findMany({ include: { rules: true } });
      res.json(roles);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch roles"); }
  });

  app.post("/api/governance/roles", async (req, res) => {
    try {
      const role = await prisma.role.create({ data: req.body });
      res.status(201).json(role);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create role"); }
  });

  app.get("/api/governance/permissions", async (req, res) => {
    try {
      const rules = await prisma.permissionRule.findMany({ include: { role: true } });
      res.json(rules);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch permissions"); }
  });

  app.post("/api/governance/permissions", async (req, res) => {
    try {
      const rule = await prisma.permissionRule.create({ data: req.body });
      res.status(201).json(rule);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create permission rule"); }
  });

  app.get("/api/governance/auditlogs", async (req, res) => {
    const { actorId, page = 1, limit = 20 } = req.query;
    try {
      const logs = await prisma.auditLog.findMany({
        where: actorId ? { actorId: String(actorId) } : {},
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });
      res.json(logs);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch audit logs"); }
  });

  app.get("/api/governance/alerts/rules", async (req, res) => {
    try {
      const rules = await prisma.alertRule.findMany();
      res.json(rules);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch alert rules"); }
  });

  app.post("/api/governance/alerts/rules", async (req, res) => {
    try {
      const rule = await prisma.alertRule.create({ data: req.body });
      res.status(201).json(rule);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create alert rule"); }
  });

  app.get("/api/governance/alerts/events", async (req, res) => {
    try {
      const events = await prisma.alertEvent.findMany({ include: { rule: true }, orderBy: { createdAt: "desc" } });
      res.json(events);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch alert events"); }
  });

  app.get("/api/governance/cost/records", async (req, res) => {
    try {
      const records = await prisma.costRecord.findMany({ orderBy: { createdAt: "desc" } });
      res.json(records);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch cost records"); }
  });

  app.get("/api/governance/usage", async (req, res) => {
    try {
        const queryCount = await prisma.queryEvent.count();
        const runCount = await prisma.run.count();
        const alertCount = await prisma.alertEvent.count();
        res.json({ queryCount, runCount, alertCount });
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch usage metrics"); }
  });

  app.get("/api/governance/config", async (req, res) => {
    try {
      const configs = await prisma.configItem.findMany();
      res.json(configs);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch config"); }
  });

  app.post("/api/governance/config", async (req, res) => {
    try {
      const config = await prisma.configItem.upsert({
        where: { key: req.body.key },
        create: req.body,
        update: req.body
      });
      res.json(config);
    } catch (err) { sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to update config"); }
  });

  app.get("/api/query-events", async (req, res) => {
    const { queryType, actorId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    try {
      const where: any = {};
      if (queryType) where.queryType = queryType as string;
      if (actorId) where.actorId = actorId as string;

      const [events, total] = await Promise.all([
        prisma.queryEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.queryEvent.count({ where })
      ]);

      res.json({
        data: events,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch query events");
    }
  });

  app.get("/api/query-events/:id", async (req, res) => {
    try {
      const event = await prisma.queryEvent.findUnique({
        where: { id: req.params.id }
      });
      if (!event) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Event not found");
      res.json(event);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch event");
    }
  });

  app.get("/api/query-events/:id/explain", async (req, res) => {
    try {
      const event = await prisma.queryEvent.findUnique({ where: { id: req.params.id } });
      if (!event) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Event not found");

      // Simulated Explain Plan based on event data
      const plan = {
        cost: event.durationMs * 1.5,
        dataSources: ["OntologyDB", "ObjectCache"],
        steps: [
          { name: "Index Scan", detail: "Scanning primary key index", cost: 10 },
          { name: "Filter", detail: `Applying filters: ${event.queryType}`, cost: 5 },
          { name: "Projection", detail: "Mapping fields", cost: 2 }
        ]
      };
      res.json(plan);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to explain query");
    }
  });

  app.get("/api/analysis/hotspots", async (req, res) => {
    const { window = '24h' } = req.query;
    try {
      const hotspots = await prisma.hotspotSnapshot.findMany({
        where: { window: window as string },
        orderBy: { hitCount: 'desc' },
        take: 20
      });
      res.json(hotspots);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch hotspots");
    }
  });

  app.post("/api/analysis/impact", async (req, res) => {
    const { rootId, save = false } = req.body;
    try {
      // Simulated Impact Calculation
      const graphData = {
        nodes: [
          { id: rootId, label: "Root" },
          { id: "dep-1", label: "Downstream Action" },
          { id: "dep-2", label: "Linked Object" }
        ],
        edges: [
          { from: rootId, to: "dep-1" },
          { from: rootId, to: "dep-2" }
        ]
      };

      if (save) {
        await prisma.impactGraphSnapshot.create({
          data: {
            rootId,
            graphData: JSON.stringify(graphData),
            score: 85.5
          }
        });
      }

      res.json({ graphData, score: 85.5 });
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to calculate impact");
    }
  });

  app.post("/api/analysis/path", async (req, res) => {
    const { fromId, toId } = req.body;
    try {
      const path = {
        from: fromId,
        to: toId,
        steps: [
          { id: fromId, type: 'object' },
          { id: 'link-1', type: 'link' },
          { id: toId, type: 'object' }
        ],
        complexity: 3
      };
      res.json(path);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to analyze path");
    }
  });

  app.get("/api/saved-views", async (req, res) => {
    try {
      const views = await prisma.savedView.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.json(views);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch saved views");
    }
  });

  app.post("/api/saved-views", async (req, res) => {
    const { name, config, category } = req.body;
    try {
      const view = await prisma.savedView.create({
        data: {
          name,
          config: JSON.stringify(config),
          category,
          actorId: 'admin'
        }
      });
      res.status(201).json(view);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to save view");
    }
  });

  app.delete("/api/saved-views/:id", async (req, res) => {
    try {
      await prisma.savedView.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to delete view");
    }
  });

  // --- Ontology Routes ---
  
  app.get("/api/ontologies", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 200);
    
    try {
      const [total, data] = await Promise.all([
        prisma.ontology.count(),
        prisma.ontology.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { updatedAt: 'desc' }
        })
      ]);
      res.json({ data, page, pageSize, total });
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch ontologies");
    }
  });

  app.get("/api/ontologies/:id", async (req, res) => {
    try {
      const ontology = await prisma.ontology.findUnique({
        where: { id: req.params.id },
        include: {
          objectTypes: { include: { properties: true } },
          linkTypes: true
        }
      });
      if (!ontology) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Ontology not found", 404);
      res.json(ontology);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch ontology");
    }
  });

  app.post("/api/ontologies", async (req, res) => {
    const { name, description } = req.body;
    if (!name) return sendError(res, ERR_CODES.INVALID_INPUT, "Name is required");

    try {
      const ontology = await prisma.ontology.create({
        data: { name, description, status: 'draft' }
      });
      res.status(201).json(ontology);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create ontology");
    }
  });

  // --- Object Type Routes ---

  app.get("/api/ontologies/:id/object-types", async (req, res) => {
    try {
      const data = await prisma.objectType.findMany({
        where: { ontologyId: req.params.id },
        include: { properties: true }
      });
      res.json(data);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch object types");
    }
  });

  app.post("/api/ontologies/:id/object-types", async (req, res) => {
    const { displayName, apiName, description } = req.body;
    try {
      const ont = await prisma.ontology.findUnique({ where: { id: req.params.id } });
      if (!ont) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Ontology not found");

      const newOT = await prisma.objectType.create({
        data: {
          ontologyId: req.params.id,
          displayName: displayName || "New Object",
          apiName: apiName || `Object_${Date.now()}`,
          description: description || "",
          status: "draft"
        }
      });
      await markOntologyAsDraft(req.params.id);
      res.status(201).json(newOT);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create object type");
    }
  });

  app.get("/api/object-types/:id", async (req, res) => {
    try {
      const ot = await prisma.objectType.findUnique({
        where: { id: req.params.id },
        include: { properties: true }
      });
      if (!ot) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Object type not found", 404);
      res.json(ot);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch object type");
    }
  });

  app.patch("/api/object-types/:id", async (req, res) => {
    try {
      const updated = await prisma.objectType.update({
        where: { id: req.params.id },
        data: req.body
      });
      await markOntologyAsDraft(updated.ontologyId);
      res.json(updated);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to update object type");
    }
  });

  app.delete("/api/object-types/:id", async (req, res) => {
    try {
      const ot = await prisma.objectType.findUnique({ where: { id: req.params.id } });
      const ontologyId = ot?.ontologyId;
      await prisma.$transaction([
        prisma.property.deleteMany({ where: { objectTypeId: req.params.id } }),
        prisma.objectType.delete({ where: { id: req.params.id } })
      ]);
      await markOntologyAsDraft(ontologyId);
      res.status(204).send();
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to delete object type");
    }
  });

  // --- Property Routes ---

  app.get("/api/object-types/:id/properties", async (req, res) => {
    try {
      const data = await prisma.property.findMany({
        where: { objectTypeId: req.params.id }
      });
      res.json(data);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch properties");
    }
  });

  app.post("/api/object-types/:id/properties", async (req, res) => {
    try {
      const ot = await prisma.objectType.findUnique({ where: { id: req.params.id } });
      const newProp = await prisma.property.create({
        data: {
          objectTypeId: req.params.id,
          displayName: req.body.displayName || "New Property",
          apiName: req.body.apiName || `prop_${Date.now()}`,
          type: req.body.type || "string",
          required: req.body.required || false
        }
      });
      await markOntologyAsDraft(ot?.ontologyId);
      res.status(201).json(newProp);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create property");
    }
  });

  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const prop = await prisma.property.findUnique({ 
        where: { id: req.params.id },
        include: { objectType: true }
       });
      const updated = await prisma.property.update({
        where: { id: req.params.id },
        data: req.body
      });
      await markOntologyAsDraft(prop?.objectType.ontologyId);
      res.json(updated);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to update property");
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const prop = await prisma.property.findUnique({ 
        where: { id: req.params.id },
        include: { objectType: true }
      });
      const ontologyId = prop?.objectType.ontologyId;
      await prisma.property.delete({ where: { id: req.params.id } });
      await markOntologyAsDraft(ontologyId);
      res.status(204).send();
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to delete property");
    }
  });

  // --- Link Type Routes ---

  app.get("/api/ontologies/:id/link-types", async (req, res) => {
    try {
      const data = await prisma.linkType.findMany({
        where: { ontologyId: req.params.id }
      });
      res.json(data);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch link types");
    }
  });

  app.post("/api/ontologies/:id/link-types", async (req, res) => {
    try {
      const newLT = await prisma.linkType.create({
        data: {
          ontologyId: req.params.id,
          displayName: req.body.displayName || "New Link",
          apiName: req.body.apiName || `link_${Date.now()}`,
          fromObject: req.body.fromObject || "",
          toObject: req.body.toObject || "",
          cardinality: req.body.cardinality || "OneToMany"
        }
      });
      res.status(201).json(newLT);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create link type");
    }
  });

  // --- Publish / Versioning Logic ---

  app.get("/api/ontologies/:id/versions", async (req, res) => {
    try {
      const data = await prisma.ontologyVersion.findMany({
        where: { ontologyId: req.params.id },
        orderBy: { createdAt: 'desc' }
      });
      res.json(data);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch versions");
    }
  });

  app.post("/api/ontologies/:id/publish", async (req, res) => {
    const { changelog } = req.body;
    try {
      const ont = await prisma.ontology.findUnique({
        where: { id: req.params.id },
        include: {
          objectTypes: { include: { properties: true } },
          linkTypes: true
        }
      });
      if (!ont) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Ontology not found");

      // Validate (Simple check)
      if (ont.objectTypes.length === 0) {
        return sendError(res, ERR_CODES.INVALID_INPUT, "Cannot publish empty ontology");
      }

      const currentVersionStr = ont.latestPublishedVersion || "v0.0.0";
      const parts = currentVersionStr.replace('v', '').split('.').map(Number);
      parts[2] += 1; // Simple patch bump
      const nextVersion = `v${parts.join('.')}`;

      const snapshot = JSON.stringify({
        objectTypes: ont.objectTypes,
        linkTypes: ont.linkTypes
      });

      const [publishedVersion] = await prisma.$transaction([
        prisma.ontologyVersion.create({
          data: {
            ontologyId: req.params.id,
            version: nextVersion,
            changelog,
            snapshot
          }
        }),
        prisma.ontology.update({
          where: { id: req.params.id },
          data: {
            latestPublishedVersion: nextVersion,
            status: 'published'
          }
        })
      ]);

      res.status(201).json(publishedVersion);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to publish ontology");
    }
  });

  app.post("/api/ontologies/:id/rollback", async (req, res) => {
    const { versionId } = req.body;
    try {
      const targetVersion = await prisma.ontologyVersion.findUnique({
        where: { id: versionId }
      });
      if (!targetVersion) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Target version not found");

      const snapshot = JSON.parse(targetVersion.snapshot);

      // Rollback transaction: Delete current draft content and restore from snapshot
      await prisma.$transaction(async (tx) => {
        // Clear current
        await tx.property.deleteMany({ where: { objectType: { ontologyId: req.params.id } } });
        await tx.objectType.deleteMany({ where: { ontologyId: req.params.id } });
        await tx.linkType.deleteMany({ where: { ontologyId: req.params.id } });

        // Restore Object Types & Properties
        for (const ot of snapshot.objectTypes) {
          const { properties, ...otData } = ot;
          // Clean up metadata for insertion (removing DB generated fields)
          const cleanOT = {
            id: otData.id,
            ontologyId: req.params.id,
            apiName: otData.apiName,
            displayName: otData.displayName,
            description: otData.description,
            status: otData.status,
            primaryKey: otData.primaryKey
          };
          await tx.objectType.create({ data: cleanOT });
          
          if (properties && properties.length > 0) {
            await tx.property.createMany({
              data: properties.map((p: any) => ({
                id: p.id,
                objectTypeId: otData.id,
                apiName: p.apiName,
                displayName: p.displayName,
                type: p.type,
                required: p.required,
                status: p.status
              }))
            });
          }
        }

        // Restore Link Types
        if (snapshot.linkTypes && snapshot.linkTypes.length > 0) {
          await tx.linkType.createMany({
            data: snapshot.linkTypes.map((lt: any) => ({
              id: lt.id,
              ontologyId: req.params.id,
              apiName: lt.apiName,
              displayName: lt.displayName,
              fromObject: lt.fromObject,
              toObject: lt.toObject,
              cardinality: lt.cardinality
            }))
          });
        }

        // Update Ontology Status
        await tx.ontology.update({
          where: { id: req.params.id },
          data: { status: 'draft' } // Rollback makes it draft for editing
        });
      });

      res.json({ message: "Rollback successful" });
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to rollback ontology");
    }
  });

  app.get("/api/ontologies/:id/diff", async (req, res) => {
    const { from, to } = req.query;
    try {
      let fromSnap: any, toSnap: any;

      const [fromVer, toVer] = await Promise.all([
        from ? prisma.ontologyVersion.findFirst({ where: { version: from as string, ontologyId: req.params.id } }) : null,
        to ? prisma.ontologyVersion.findFirst({ where: { version: to as string, ontologyId: req.params.id } }) : null
      ]);

      if (from && !fromVer) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "From version not found");
      if (to && !toVer) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "To version not found");

      fromSnap = fromVer ? JSON.parse(fromVer.snapshot) : { objectTypes: [], linkTypes: [] };
      
      if (toVer) {
        toSnap = JSON.parse(toVer.snapshot);
      } else {
        // Assume context is current draft vs fromVer
        const currentOnt = await prisma.ontology.findUnique({
          where: { id: req.params.id },
          include: { objectTypes: { include: { properties: true } }, linkTypes: true }
        });
        toSnap = { objectTypes: currentOnt?.objectTypes || [], linkTypes: currentOnt?.linkTypes || [] };
      }

      // Simple diff logic
      const added = { objectTypes: [], linkTypes: [] };
      const removed = { objectTypes: [], linkTypes: [] };
      const modified = { objectTypes: [], linkTypes: [] };

      const fromOTs = new Map(fromSnap.objectTypes.map((o: any) => [o.id, o]));
      const toOTs = new Map(toSnap.objectTypes.map((o: any) => [o.id, o]));

      toOTs.forEach((o: any, id) => {
        if (!fromOTs.has(id)) (added.objectTypes as any).push(o);
        else if (JSON.stringify(o) !== JSON.stringify(fromOTs.get(id))) (modified.objectTypes as any).push(o);
      });
      fromOTs.forEach((o: any, id) => {
        if (!toOTs.has(id)) (removed.objectTypes as any).push(o);
      });

      res.json({ added, removed, modified });
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to calculate diff");
    }
  });

  // --- Audit Logs ---
  app.get("/api/audits", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 200);
    try {
      const [total, data] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        })
      ]);
      res.json({ data, page, pageSize, total });
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch audits");
    }
  });

  // --- Action Definition Routes ---

  app.get("/api/actions", async (req, res) => {
    try {
      const actions = await prisma.actionDefinition.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.json(actions);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch actions");
    }
  });

  app.get("/api/actions/:id", async (req, res) => {
    try {
      const action = await prisma.actionDefinition.findUnique({
        where: { id: req.params.id }
      });
      if (!action) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Action not found", 404);
      res.json(action);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch action");
    }
  });

  app.post("/api/actions", async (req, res) => {
    const { displayName, apiName, parameters, guardPolicy, script } = req.body;
    try {
      const action = await prisma.actionDefinition.create({
        data: {
          displayName,
          apiName,
          parameters: JSON.stringify(parameters || {}),
          guardPolicy: JSON.stringify(guardPolicy || {}),
          script: script || "",
          status: "draft"
        }
      });
      res.status(201).json(action);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to create action");
    }
  });

  app.patch("/api/actions/:id", async (req, res) => {
    const { parameters, guardPolicy, ...rest } = req.body;
    try {
      const data: any = { ...rest };
      if (parameters) data.parameters = JSON.stringify(parameters);
      if (guardPolicy) data.guardPolicy = JSON.stringify(guardPolicy);

      const updated = await prisma.actionDefinition.update({
        where: { id: req.params.id },
        data
      });
      res.json(updated);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to update action");
    }
  });

  app.post("/api/actions/:id/execute", async (req, res) => {
    const { input, idempotencyKey } = req.body;
    try {
      const action = await prisma.actionDefinition.findUnique({
        where: { id: req.params.id }
      });
      if (!action) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Action not found", 404);

      // Guard Policies
      const guard = JSON.parse(action.guardPolicy || "{}");
      if (guard.requireApproval) {
        return sendError(res, ERR_CODES.PERMISSION_DENIED, "Action execution requires manual approval", 403);
      }

      // Idempotency check
      if (idempotencyKey) {
        const existingRun = await prisma.run.findUnique({
          where: { idempotencyKey }
        });
        if (existingRun) {
          return res.json(existingRun);
        }
      }

      const run = await prisma.run.create({
        data: {
          actionId: action.id,
          input: JSON.stringify(input || {}),
          idempotencyKey: idempotencyKey || null,
          status: "queued"
        }
      });

      // Async start
      runManager.enqueue(run.id);

      res.status(202).json(run);
    } catch (err: any) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, `Execution failed: ${err.message}`);
    }
  });

  // --- Run Routes ---

  app.get("/api/runs", async (req, res) => {
    const { actionId } = req.query;
    try {
      const runs = await prisma.run.findMany({
        where: actionId ? { actionId: actionId as string } : {},
        include: { action: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      res.json(runs);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch runs");
    }
  });

  app.get("/api/runs/:id", async (req, res) => {
    try {
      const run = await prisma.run.findUnique({
        where: { id: req.params.id },
        include: { 
          action: true,
          steps: { orderBy: { startTime: 'asc' } }
        }
      });
      if (!run) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Run not found", 404);
      res.json(run);
    } catch (err) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, "Failed to fetch run details");
    }
  });

  app.post("/api/runs/:id/cancel", async (req, res) => {
    try {
      await runManager.cancel(req.params.id);
      const updated = await prisma.run.findUnique({ where: { id: req.params.id } });
      res.json(updated);
    } catch (err: any) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, err.message);
    }
  });

  app.post("/api/runs/:id/retry", async (req, res) => {
    try {
      const oldRun = await prisma.run.findUnique({ where: { id: req.params.id } });
      if (!oldRun) return sendError(res, ERR_CODES.RESOURCE_NOT_FOUND, "Original run not found");

      const newRun = await prisma.run.create({
        data: {
          actionId: oldRun.actionId,
          input: oldRun.input,
          parentRunId: oldRun.id,
          status: "queued"
        }
      });

      runManager.enqueue(newRun.id);
      res.status(202).json(newRun);
    } catch (err: any) {
      sendError(res, ERR_CODES.INTERNAL_ERROR, err.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
