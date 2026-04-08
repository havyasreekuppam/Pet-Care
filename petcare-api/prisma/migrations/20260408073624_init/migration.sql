-- CreateTable
CREATE TABLE "pet_activities" (
    "id" SERIAL NOT NULL,
    "petName" VARCHAR(50) NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" VARCHAR(500),
    "duration" INTEGER,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pet_activities_pkey" PRIMARY KEY ("id")
);
