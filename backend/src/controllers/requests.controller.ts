import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      desiredTime,
      timeFlexibility,
      seatsNeeded,
      maxPrice,
    } = req.body;

    // Validation
    if (!pickupLat || !pickupLng || !pickupAddress || !dropoffLat || !dropoffLng || !dropoffAddress || !desiredTime || !seatsNeeded) {
      res.status(400).json({ error: 'All request details are required' });
      return;
    }

    const request = await prisma.rideRequest.create({
      data: {
        riderId: req.userId!,
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        pickupAddress,
        dropoffLat: parseFloat(dropoffLat),
        dropoffLng: parseFloat(dropoffLng),
        dropoffAddress,
        desiredTime: new Date(desiredTime),
        timeFlexibility: timeFlexibility ? parseInt(timeFlexibility) : 30,
        seatsNeeded: parseInt(seatsNeeded),
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        status: 'OPEN',
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            totalRides: true,
          },
        },
      },
    });

    res.status(201).json({ message: 'Ride request created successfully', request });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create ride request' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.rideRequest.findMany({
      where: {
        riderId: req.userId,
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            totalRides: true,
          },
        },
        bookings: {
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
          },
        },
      },
      orderBy: {
        desiredTime: 'desc',
      },
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to get your ride requests' });
  }
};

export const getRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.rideRequest.findUnique({
      where: { id },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            totalRides: true,
          },
        },
        bookings: {
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
          },
        },
      },
    });

    if (!request) {
      res.status(404).json({ error: 'Ride request not found' });
      return;
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get ride request' });
  }
};

export const updateRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user owns the request
    const existingRequest = await prisma.rideRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      res.status(404).json({ error: 'Ride request not found' });
      return;
    }

    if (existingRequest.riderId !== req.userId) {
      res.status(403).json({ error: 'You can only update your own ride requests' });
      return;
    }

    const request = await prisma.rideRequest.update({
      where: { id },
      data: updates,
      include: {
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

    res.json({ message: 'Ride request updated successfully', request });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update ride request' });
  }
};

export const deleteRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user owns the request
    const existingRequest = await prisma.rideRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      res.status(404).json({ error: 'Ride request not found' });
      return;
    }

    if (existingRequest.riderId !== req.userId) {
      res.status(403).json({ error: 'You can only delete your own ride requests' });
      return;
    }

    // Instead of deleting, mark as cancelled
    await prisma.rideRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Ride request cancelled successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to cancel ride request' });
  }
};

export const getRequestMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.rideRequest.findUnique({
      where: { id },
    });

    if (!request) {
      res.status(404).json({ error: 'Ride request not found' });
      return;
    }

    if (request.riderId !== req.userId) {
      res.status(403).json({ error: 'You can only view matches for your own ride requests' });
      return;
    }

    // Get all active rides
    const rides = await prisma.ride.findMany({
      where: {
        status: 'ACTIVE',
        departureTime: {
          gte: new Date(),
        },
      },
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
        bookings: {
          select: {
            seatsBooked: true,
            status: true,
          },
        },
      },
    });

    // Calculate match scores
    const matches = rides.map(ride => {
      const bookedSeats = ride.bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
        .reduce((sum, b) => sum + b.seatsBooked, 0);
      
      const remainingSeats = ride.availableSeats - bookedSeats;
      
      // Skip if not enough seats
      if (remainingSeats < request.seatsNeeded) {
        return null;
      }

      const score = calculateSimpleMatchScore(ride, request);
      
      return {
        ...ride,
        remainingSeats,
        matchScore: score,
      };
    }).filter(m => m !== null && m.matchScore > 0.3) // Only show matches above 30%
      .sort((a, b) => b!.matchScore - a!.matchScore);

    res.json({ matches });
  } catch (error) {
    console.error('Get request matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Simple matching algorithm (same as in rides controller)
function calculateSimpleMatchScore(ride: any, request: any): number {
  // Time matching (50%)
  const timeDiff = Math.abs(new Date(ride.departureTime).getTime() - new Date(request.desiredTime).getTime());
  const timeFlexibilityMs = request.timeFlexibility * 60 * 1000;
  const timeScore = Math.max(0, 1 - (timeDiff / (timeFlexibilityMs * 2)));

  // Price matching (25%)
  const priceScore = request.maxPrice 
    ? Math.min(1, request.maxPrice / ride.pricePerSeat)
    : 1;

  // Basic route overlap (25%)
  const routeScore = calculateRouteOverlap(
    ride.startLat, ride.startLng, ride.endLat, ride.endLng,
    request.pickupLat, request.pickupLng, request.dropoffLat, request.dropoffLng
  );

  return (timeScore * 0.5) + (priceScore * 0.25) + (routeScore * 0.25);
}

function calculateRouteOverlap(
  rideStartLat: number, rideStartLng: number, rideEndLat: number, rideEndLng: number,
  reqPickupLat: number, reqPickupLng: number, reqDropoffLat: number, reqDropoffLng: number
): number {
  const distance1 = getDistance(rideStartLat, rideStartLng, reqPickupLat, reqPickupLng);
  const distance2 = getDistance(rideEndLat, rideEndLng, reqDropoffLat, reqDropoffLng);
  
  const maxDistance = 5000; // 5km in meters
  const score1 = Math.max(0, 1 - (distance1 / maxDistance));
  const score2 = Math.max(0, 1 - (distance2 / maxDistance));
  
  return (score1 + score2) / 2;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

