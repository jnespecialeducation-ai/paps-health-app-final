-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MeasurementSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heightCm" REAL NOT NULL,
    "weightKg" REAL NOT NULL,
    "bmi" REAL NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "aiRecommendation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MeasurementSession_studentId_idx" ON "MeasurementSession"("studentId");

-- CreateIndex
CREATE INDEX "MeasurementSession_measuredAt_idx" ON "MeasurementSession"("measuredAt");
