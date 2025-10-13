-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DRIVER', 'RIDER', 'BOTH');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RouteFlexibility" AS ENUM ('RIGID', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'MATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('HOLD', 'CHARGED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'RIDER',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRides" INTEGER NOT NULL DEFAULT 0,
    "driverLicense" TEXT,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleYear" INTEGER,
    "licensePlate" TEXT,
    "insuranceProof" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLng" DOUBLE PRECISION NOT NULL,
    "startAddress" TEXT NOT NULL,
    "endLat" DOUBLE PRECISION NOT NULL,
    "endLng" DOUBLE PRECISION NOT NULL,
    "endAddress" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "pricePerSeat" DOUBLE PRECISION NOT NULL,
    "routeFlexibility" "RouteFlexibility" NOT NULL DEFAULT 'FLEXIBLE',
    "status" "RideStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideRequest" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropoffLat" DOUBLE PRECISION NOT NULL,
    "dropoffLng" DOUBLE PRECISION NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "desiredTime" TIMESTAMP(3) NOT NULL,
    "timeFlexibility" INTEGER NOT NULL DEFAULT 30,
    "seatsNeeded" INTEGER NOT NULL,
    "maxPrice" DOUBLE PRECISION,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "rideRequestId" TEXT,
    "riderId" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropoffLat" DOUBLE PRECISION NOT NULL,
    "dropoffLng" DOUBLE PRECISION NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "seatsBooked" INTEGER NOT NULL,
    "agreedPrice" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'HOLD',
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "rideId" TEXT,
    "rideRequestId" TEXT,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rateeId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_bookingId_key" ON "Rating"("bookingId");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_rideRequestId_fkey" FOREIGN KEY ("rideRequestId") REFERENCES "RideRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_rideRequestId_fkey" FOREIGN KEY ("rideRequestId") REFERENCES "RideRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rateeId_fkey" FOREIGN KEY ("rateeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
