-- CreateTable
CREATE TABLE "EarningsDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayLabel" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "isToday" BOOLEAN NOT NULL DEFAULT false,
    "isOutOfMonth" BOOLEAN NOT NULL DEFAULT false,
    "companyCount" INTEGER,
    "companies" TEXT
);

-- CreateTable
CREATE TABLE "EpsRow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "mktCap" TEXT NOT NULL,
    "epsNormalized" TEXT NOT NULL,
    "epsYoY" TEXT NOT NULL,
    "epsYoYPositive" BOOLEAN NOT NULL,
    "epsGaap" TEXT NOT NULL,
    "epsActual" TEXT,
    "epsBeatMiss" TEXT,
    "lastQGaap" TEXT NOT NULL,
    "lastQBeatMiss" TEXT,
    "beatsL2Y" INTEGER NOT NULL,
    "missedL2Y" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "RevenueRow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "mktCap" TEXT NOT NULL,
    "revConsensus" TEXT NOT NULL,
    "revYoY" TEXT NOT NULL,
    "revYoYPositive" BOOLEAN NOT NULL,
    "revHighEst" TEXT NOT NULL,
    "revActual" TEXT,
    "revBeatMiss" TEXT,
    "lastQActual" TEXT NOT NULL,
    "lastQBeatMiss" TEXT
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NewsTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "newsItemId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "change" REAL NOT NULL,
    CONSTRAINT "NewsTag_newsItemId_fkey" FOREIGN KEY ("newsItemId") REFERENCES "NewsItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BannerSlide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "labelVariant" TEXT NOT NULL,
    "prefix" TEXT,
    "linkText" TEXT NOT NULL,
    "linkHref" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "EarningsDay_dateLabel_key" ON "EarningsDay"("dateLabel");
