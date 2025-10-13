import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      startLat,
      startLng,
      startAddress,
      endLat,
      endLng,
      endAddress,
      departureTime,
      availableSeats,
      pricePerSeat,
      routeFlexibility,
    } = req.body;

    // Validation
    if (!startLat || !startLng || !startAddress || !endLat || !endLng || !endAddress || !departureTime || !availableSeats || !pricePerSeat) {
      res.status(400).json({ error: 'All ride details are required' });
      return;
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: req.userId!,
        startLat: parseFloat(startLat),
        startLng: parseFloat(startLng),
        startAddress,
        endLat: parseFloat(endLat),
        endLng: parseFloat(endLng),
        endAddress,
        departureTime: new Date(departureTime),
        availableSeats: parseInt(availableSeats),
        pricePerSeat: parseFloat(pricePerSeat),
        routeFlexibility: routeFlexibility || 'FLEXIBLE',
        status: 'ACTIVE',
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
      },
    });

    res.status(201).json({ message: 'Ride created successfully', ride });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Failed to create ride' });
  }
};

export const getAllRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const rides = await prisma.ride.findMany({
      where: {
        status: (status as any) || 'ACTIVE',
        departureTime: {
          gte: new Date(), // Only future rides
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
      orderBy: {
        departureTime: 'asc',
      },
    });

    // Calculate remaining seats for each ride
    const ridesWithSeats = rides.map(ride => {
      const bookedSeats = ride.bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
        .reduce((sum, b) => sum + b.seatsBooked, 0);
      
      return {
        ...ride,
        remainingSeats: ride.availableSeats - bookedSeats,
      };
    });

    res.json({ rides: ridesWithSeats });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ error: 'Failed to get rides' });
  }
};

export const getMyRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        driverId: req.userId,
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
        },
      },
      orderBy: {
        departureTime: 'desc',
      },
    });

    res.json({ rides });
  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({ error: 'Failed to get your rides' });
  }
};

export const getRideById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id },
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
        },
      },
    });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    res.json({ ride });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ error: 'Failed to get ride' });
  }
};

export const updateRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user owns the ride
    const existingRide = await prisma.ride.findUnique({
      where: { id },
    });

    if (!existingRide) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    if (existingRide.driverId !== req.userId) {
      res.status(403).json({ error: 'You can only update your own rides' });
      return;
    }

    const ride = await prisma.ride.update({
      where: { id },
      data: updates,
      include: {
        driver: {
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

    res.json({ message: 'Ride updated successfully', ride });
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ error: 'Failed to update ride' });
  }
};

export const deleteRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user owns the ride
    const existingRide = await prisma.ride.findUnique({
      where: { id },
    });

    if (!existingRide) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    if (existingRide.driverId !== req.userId) {
      res.status(403).json({ error: 'You can only delete your own rides' });
      return;
    }

    // Instead of deleting, mark as cancelled
    await prisma.ride.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ error: 'Failed to cancel ride' });
  }
};

export const getRideMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    if (ride.driverId !== req.userId) {
      res.status(403).json({ error: 'You can only view matches for your own rides' });
      return;
    }

    // Get all open ride requests
    const requests = await prisma.rideRequest.findMany({
      where: {
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

    // Calculate match scores (simplified version)
    const matches = requests.map(request => {
      const score = calculateSimpleMatchScore(ride, request);
      return {
        ...request,
        matchScore: score,
      };
    }).filter(m => m.matchScore > 0.3) // Only show matches above 30%
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ matches });
  } catch (error) {
    console.error('Get ride matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Simple matching algorithm
function calculateSimpleMatchScore(ride: any, request: any): number {
  // Time matching (50%)
  const timeDiff = Math.abs(new Date(ride.departureTime).getTime() - new Date(request.desiredTime).getTime());
  const timeFlexibilityMs = request.timeFlexibility * 60 * 1000;
  const timeScore = Math.max(0, 1 - (timeDiff / (timeFlexibilityMs * 2)));

  // Price matching (25%)
  const priceScore = request.maxPrice 
    ? Math.min(1, request.maxPrice / ride.pricePerSeat)
    : 1;

  // Basic route overlap (25%) - simplified distance check
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
  // Simplified haversine distance calculation
  const distance1 = getDistance(rideStartLat, rideStartLng, reqPickupLat, reqPickupLng);
  const distance2 = getDistance(rideEndLat, rideEndLng, reqDropoffLat, reqDropoffLng);
  
  // If both start and end are within 5km, consider it a good match
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

