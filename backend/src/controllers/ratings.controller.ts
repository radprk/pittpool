import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, rateeId, stars, review } = req.body;

    // Validation
    if (!bookingId || !rateeId || !stars) {
      res.status(400).json({ error: 'Booking ID, ratee ID, and stars are required' });
      return;
    }

    if (stars < 1 || stars > 5) {
      res.status(400).json({ error: 'Stars must be between 1 and 5' });
      return;
    }

    // Check if booking exists and user is involved
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Can only rate completed bookings' });
      return;
    }

    // Check if user is involved in this booking
    if (booking.riderId !== req.userId && booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'You can only rate bookings you were involved in' });
      return;
    }

    // Check if rating already exists
    const existingRating = await prisma.rating.findUnique({
      where: { bookingId },
    });

    if (existingRating) {
      res.status(409).json({ error: 'This booking has already been rated' });
      return;
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        bookingId,
        raterId: req.userId!,
        rateeId,
        stars: parseInt(stars),
        review: review || null,
      },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        ratee: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Update user's average rating
    const allRatings = await prisma.rating.findMany({
      where: { rateeId },
      select: { stars: true },
    });

    const avgRating = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;

    await prisma.user.update({
      where: { id: rateeId },
      data: { rating: avgRating },
    });

    res.status(201).json({ message: 'Rating submitted successfully', rating });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
};

export const getUserRatings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const ratings = await prisma.rating.findMany({
      where: { rateeId: userId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        booking: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        rating: true,
        totalRides: true,
      },
    });

    res.json({
      ratings,
      averageRating: user?.rating || 0,
      totalRatings: ratings.length,
      totalRides: user?.totalRides || 0,
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Failed to get user ratings' });
  }
};

