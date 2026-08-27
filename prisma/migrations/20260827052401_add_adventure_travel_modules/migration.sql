-- CreateEnum
CREATE TYPE "AdventurePricingUnit" AS ENUM ('PER_PERSON', 'PER_NIGHT', 'PER_GROUP', 'FIXED');

-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('BUS', 'TAXI');

-- CreateEnum
CREATE TYPE "TravelPricingUnit" AS ENUM ('PER_SEAT', 'PER_TRIP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingType" ADD VALUE 'ADVENTURE';
ALTER TYPE "BookingType" ADD VALUE 'TRAVEL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'ADVENTURE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'TRAVEL_MANAGER';

-- CreateTable
CREATE TABLE "AdventureCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdventureCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdventureItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT NOT NULL,
    "pricingUnit" "AdventurePricingUnit" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "minCapacity" INTEGER,
    "maxCapacity" INTEGER,
    "includes" TEXT[],
    "excludes" TEXT[],
    "requirements" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdventureItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdventureMedia" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdventureMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdventureSlot" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "capacity" INTEGER NOT NULL,
    "bookedUnits" INTEGER NOT NULL DEFAULT 0,
    "status" "SlotStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdventureSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelRoute" (
    "id" TEXT NOT NULL,
    "mode" "TravelMode" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricingUnit" "TravelPricingUnit" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "includes" TEXT[],
    "excludes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelMedia" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TravelMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelSlot" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "departureTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "bookedSeats" INTEGER NOT NULL DEFAULT 0,
    "status" "SlotStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItemAdventure" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BookingItemAdventure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItemTravel" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BookingItemTravel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdventureCategory_slug_key" ON "AdventureCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdventureItem_slug_key" ON "AdventureItem"("slug");

-- CreateIndex
CREATE INDEX "AdventureItem_categoryId_idx" ON "AdventureItem"("categoryId");

-- CreateIndex
CREATE INDEX "AdventureItem_isActive_idx" ON "AdventureItem"("isActive");

-- CreateIndex
CREATE INDEX "AdventureMedia_itemId_idx" ON "AdventureMedia"("itemId");

-- CreateIndex
CREATE INDEX "AdventureSlot_itemId_date_idx" ON "AdventureSlot"("itemId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AdventureSlot_itemId_date_key" ON "AdventureSlot"("itemId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TravelRoute_slug_key" ON "TravelRoute"("slug");

-- CreateIndex
CREATE INDEX "TravelRoute_mode_idx" ON "TravelRoute"("mode");

-- CreateIndex
CREATE INDEX "TravelRoute_isActive_idx" ON "TravelRoute"("isActive");

-- CreateIndex
CREATE INDEX "TravelMedia_routeId_idx" ON "TravelMedia"("routeId");

-- CreateIndex
CREATE INDEX "TravelSlot_routeId_date_idx" ON "TravelSlot"("routeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TravelSlot_routeId_date_departureTime_key" ON "TravelSlot"("routeId", "date", "departureTime");

-- CreateIndex
CREATE INDEX "BookingItemAdventure_bookingId_idx" ON "BookingItemAdventure"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItemAdventure_slotId_idx" ON "BookingItemAdventure"("slotId");

-- CreateIndex
CREATE INDEX "BookingItemTravel_bookingId_idx" ON "BookingItemTravel"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItemTravel_slotId_idx" ON "BookingItemTravel"("slotId");

-- AddForeignKey
ALTER TABLE "AdventureItem" ADD CONSTRAINT "AdventureItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AdventureCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdventureMedia" ADD CONSTRAINT "AdventureMedia_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AdventureItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdventureSlot" ADD CONSTRAINT "AdventureSlot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AdventureItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelMedia" ADD CONSTRAINT "TravelMedia_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TravelRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelSlot" ADD CONSTRAINT "TravelSlot_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TravelRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItemAdventure" ADD CONSTRAINT "BookingItemAdventure_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItemAdventure" ADD CONSTRAINT "BookingItemAdventure_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AdventureItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItemAdventure" ADD CONSTRAINT "BookingItemAdventure_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AdventureSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItemTravel" ADD CONSTRAINT "BookingItemTravel_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItemTravel" ADD CONSTRAINT "BookingItemTravel_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TravelRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItemTravel" ADD CONSTRAINT "BookingItemTravel_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TravelSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
