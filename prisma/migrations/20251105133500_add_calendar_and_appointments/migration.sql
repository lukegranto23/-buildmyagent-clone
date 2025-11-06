-- CreateTable
CREATE TABLE "CalendarConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "meetingDuration" INTEGER NOT NULL DEFAULT 30,
    "bufferBefore" INTEGER NOT NULL DEFAULT 10,
    "bufferAfter" INTEGER NOT NULL DEFAULT 10,
    "availability" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "externalId" TEXT,
    "customerName" TEXT,
    "customerContact" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'unknown',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "source" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConfig_agentId_key" ON "CalendarConfig"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_externalId_key" ON "Appointment"("externalId");

-- CreateIndex
CREATE INDEX "Appointment_agentId_start_idx" ON "Appointment"("agentId", "start");

-- CreateIndex
CREATE INDEX "Appointment_status_start_idx" ON "Appointment"("status", "start");


