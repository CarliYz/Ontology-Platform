-- CreateTable
CREATE TABLE "QueryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queryType" TEXT NOT NULL,
    "targetRef" TEXT,
    "parameters" TEXT,
    "durationMs" INTEGER NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "QueryPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "complexity" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HotspotSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "window" TEXT NOT NULL,
    "targetRef" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL,
    "intensity" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ImpactGraphSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rootId" TEXT NOT NULL,
    "graphData" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SavedView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
