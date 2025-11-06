-- CreateTable
CREATE TABLE "WorkflowVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "nodes" TEXT NOT NULL,
    "edges" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowVersion_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowPresence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "displayName" TEXT,
    "color" TEXT,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowPresence_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" TEXT NOT NULL,
    "edges" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "schedule" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "activeVersionId" TEXT,
    CONSTRAINT "Workflow_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Workflow_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "WorkflowVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Workflow" ("agentId", "createdAt", "description", "edges", "id", "metadata", "name", "nodes", "schedule", "status", "updatedAt") SELECT "agentId", "createdAt", "description", "edges", "id", "metadata", "name", "nodes", "schedule", "status", "updatedAt" FROM "Workflow";
DROP TABLE "Workflow";
ALTER TABLE "new_Workflow" RENAME TO "Workflow";
CREATE UNIQUE INDEX "Workflow_activeVersionId_key" ON "Workflow"("activeVersionId");
CREATE INDEX "Workflow_agentId_idx" ON "Workflow"("agentId");
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "WorkflowVersion_workflowId_versionNumber_idx" ON "WorkflowVersion"("workflowId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowVersion_workflowId_versionNumber_key" ON "WorkflowVersion"("workflowId", "versionNumber");

-- CreateIndex
CREATE INDEX "WorkflowPresence_workflowId_lastSeen_idx" ON "WorkflowPresence"("workflowId", "lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowPresence_workflowId_sessionId_key" ON "WorkflowPresence"("workflowId", "sessionId");
