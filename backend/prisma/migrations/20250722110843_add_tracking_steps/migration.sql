-- CreateTable
CREATE TABLE "ParcelTrackingStep" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelTrackingStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParcelTrackingStep" ADD CONSTRAINT "ParcelTrackingStep_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
