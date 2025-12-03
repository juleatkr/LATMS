-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN "hrApprovedAt" DATETIME;
ALTER TABLE "LeaveRequest" ADD COLUMN "hrApprovedBy" TEXT;
ALTER TABLE "LeaveRequest" ADD COLUMN "managementApprovedAt" DATETIME;
ALTER TABLE "LeaveRequest" ADD COLUMN "managementApprovedBy" TEXT;
ALTER TABLE "LeaveRequest" ADD COLUMN "managerApprovedAt" DATETIME;
ALTER TABLE "LeaveRequest" ADD COLUMN "managerApprovedBy" TEXT;
