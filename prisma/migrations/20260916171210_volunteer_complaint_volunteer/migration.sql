-- CreateEnum
CREATE TYPE "VolunteerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplaintVolunteerStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'REJECTED', 'SUBMITTED', 'RESOLVED');

-- CreateTable
CREATE TABLE "complaint_volunteers" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "status" "ComplaintVolunteerStatus" NOT NULL DEFAULT 'APPLIED',
    "message" TEXT,
    "statusNote" TEXT,
    "solutionImages" TEXT[],
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaint_volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "skills" TEXT[],
    "status" "VolunteerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "totalResolved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "complaint_volunteers_complaintId_idx" ON "complaint_volunteers"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_volunteers_volunteerId_idx" ON "complaint_volunteers"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "complaint_volunteers_complaintId_volunteerId_key" ON "complaint_volunteers"("complaintId", "volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profiles_userId_key" ON "volunteer_profiles"("userId");

-- AddForeignKey
ALTER TABLE "complaint_volunteers" ADD CONSTRAINT "complaint_volunteers_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_volunteers" ADD CONSTRAINT "complaint_volunteers_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
