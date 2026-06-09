-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'CARE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'CAREGIVER', 'VIEWER');

-- CreateEnum
CREATE TYPE "DeviceComponentType" AS ENUM ('GATEWAY', 'SENSOR', 'HELP_BUTTON');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HELP_REQUEST', 'SENSOR_OFFLINE', 'BUTTON_OFFLINE', 'SYSTEM_FAILURE', 'INACTIVITY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertSubjectType" AS ENUM ('GATEWAY', 'SENSOR', 'HELP_BUTTON', 'HOUSEHOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "addressLabel" TEXT,
    "plan" "PlanTier" NOT NULL DEFAULT 'CARE',
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdSettings" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "inactivityThresholdMinutes" INTEGER NOT NULL DEFAULT 120,
    "sensorCheckIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "buttonCheckIntervalMinutes" INTEGER NOT NULL DEFAULT 10,
    "sleepModeStart" TEXT,
    "sleepModeEnd" TEXT,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gateway" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "firmwareVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "locationLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpButton" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "locationLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "lastPressedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpButton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorEvent" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SensorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpButtonEvent" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "helpButtonId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceEventId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "HelpButtonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceHeartbeat" (
    "id" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "componentType" "DeviceComponentType" NOT NULL,
    "componentId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "DeviceHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjectType" "AlertSubjectType",
    "subjectId" TEXT,
    "metadata" JSONB,
    "acknowledgedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_householdId_userId_key" ON "HouseholdMember"("householdId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdSettings_householdId_key" ON "HouseholdSettings"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "Gateway_serialNumber_key" ON "Gateway"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Gateway_tokenHash_key" ON "Gateway"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_gatewayId_externalId_key" ON "Sensor"("gatewayId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpButton_gatewayId_externalId_key" ON "HelpButton"("gatewayId", "externalId");

-- CreateIndex
CREATE INDEX "SensorEvent_householdId_detectedAt_idx" ON "SensorEvent"("householdId", "detectedAt");

-- CreateIndex
CREATE INDEX "HelpButtonEvent_householdId_triggeredAt_idx" ON "HelpButtonEvent"("householdId", "triggeredAt");

-- CreateIndex
CREATE INDEX "DeviceHeartbeat_gatewayId_receivedAt_idx" ON "DeviceHeartbeat"("gatewayId", "receivedAt");

-- CreateIndex
CREATE INDEX "DeviceHeartbeat_componentType_componentId_idx" ON "DeviceHeartbeat"("componentType", "componentId");

-- CreateIndex
CREATE INDEX "Alert_householdId_status_createdAt_idx" ON "Alert"("householdId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_type_status_idx" ON "Alert"("type", "status");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdSettings" ADD CONSTRAINT "HouseholdSettings_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gateway" ADD CONSTRAINT "Gateway_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpButton" ADD CONSTRAINT "HelpButton_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpButton" ADD CONSTRAINT "HelpButton_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorEvent" ADD CONSTRAINT "SensorEvent_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorEvent" ADD CONSTRAINT "SensorEvent_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpButtonEvent" ADD CONSTRAINT "HelpButtonEvent_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpButtonEvent" ADD CONSTRAINT "HelpButtonEvent_helpButtonId_fkey" FOREIGN KEY ("helpButtonId") REFERENCES "HelpButton"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceHeartbeat" ADD CONSTRAINT "DeviceHeartbeat_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
