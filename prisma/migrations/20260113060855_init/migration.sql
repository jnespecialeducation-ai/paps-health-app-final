-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "aiRecommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeasurementSession_studentId_idx" ON "MeasurementSession"("studentId");

-- CreateIndex
CREATE INDEX "MeasurementSession_measuredAt_idx" ON "MeasurementSession"("measuredAt");

-- AddForeignKey
ALTER TABLE "MeasurementSession" ADD CONSTRAINT "MeasurementSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
