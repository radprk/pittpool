import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      rideId,
      rideRequestId,
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      seatsBooked,
      agreedPrice,
    } = req.body;

    // Validation
    if (!rideId || !pickupLat || !pickupLng || !pickupAddress || !dropoffLat || !dropoffLng || !dropoffAddress || !seatsBooked || !agreedPrice) {
      res.status(400).json({ error: 'All booking details are required' });
      return;
    }

    // Check if ride exists and has enough seats
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
        },
      },
    });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    // Calculate remaining seats
    const bookedSeats = ride.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
    const remainingSeats = ride.availableSeats - bookedSeats;

    if (remainingSeats < parseInt(seatsBooked)) {
      res.status(400).json({ error: 'Not enough seats available' });
      return;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        rideId,
        rideRequestId: rideRequestId || null,
        riderId: req.userId!,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        pickupAddress,
        dropoffLat: parseFloat(dropoffLat),
        dropoffLng: parseFloat(dropoffLng),
        dropoffAddress,
        seatsBooked: parseInt(seatsBooked),
        agreedPrice: parseFloat(agreedPrice),
        status: 'PENDING',
        paymentStatus: 'HOLD',
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
              },
            },
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
      },
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        riderId: req.userId,
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
                totalRides: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleYear: true,
              },
            },
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Failed to get your bookings' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
                phone: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleYear: true,
                licensePlate: true,
              },
            },
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if user is involved in this booking
    if (booking.riderId !== req.userId && booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'You do not have access to this booking' });
      return;
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
};

export const confirmBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Only driver can confirm booking
    if (booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'Only the driver can confirm this booking' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
              },
            },
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
      },
    });

    res.json({ message: 'Booking confirmed successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
};

export const completeBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Only driver can complete booking
    if (booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'Only the driver can complete this booking' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'CHARGED', // In production, this would happen via Stripe webhook
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
              },
            },
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
      },
    });

    // Update total rides for both users
    await prisma.user.update({
      where: { id: booking.riderId },
      data: {
        totalRides: {
          increment: 1,
        },
      },
    });

    await prisma.user.update({
      where: { id: booking.ride.driverId },
      data: {
        totalRides: {
          increment: 1,
        },
      },
    });

    res.json({ message: 'Booking completed successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Either rider or driver can cancel
    if (booking.riderId !== req.userId && booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'You do not have permission to cancel this booking' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED', // In production, this would happen via Stripe
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                rating: true,
              },
            },
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
      },
    });

    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

