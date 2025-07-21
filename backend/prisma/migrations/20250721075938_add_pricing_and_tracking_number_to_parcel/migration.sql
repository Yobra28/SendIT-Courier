/*
  Warnings:

  - A unique constraint covering the columns `[trackingNumber]` on the table `Parcel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pricing` to the `Parcel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingNumber` to the `Parcel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "pricing" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "trackingNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_trackingNumber_key" ON "Parcel"("trackingNumber");
