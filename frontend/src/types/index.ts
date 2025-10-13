export type User = {
  id: string;
  email: string;
  phone: string;
  name: string;
  profilePhoto?: string;
  role: 'DRIVER' | 'RIDER' | 'BOTH';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rating: number;
  totalRides: number;
  driverLicense?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  licensePlate?: string;
  insuranceProof?: string;
  createdAt: string;
  updatedAt: string;
}

export type Ride = {
  id: string;
  driverId: string;
  driver: Partial<User>;
  startLat: number;
  startLng: number;
  startAddress: string;
  endLat: number;
  endLng: number;
  endAddress: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  routeFlexibility: 'RIGID' | 'FLEXIBLE';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  remainingSeats?: number;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
}

export type RideRequest = {
  id: string;
  riderId: string;
  rider: Partial<User>;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  desiredTime: string;
  timeFlexibility: number;
  seatsNeeded: number;
  maxPrice?: number;
  status: 'OPEN' | 'MATCHED' | 'COMPLETED' | 'CANCELLED';
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
}

export type Booking = {
  id: string;
  rideId: string;
  ride: Ride;
  rideRequestId?: string;
  rideRequest?: RideRequest;
  riderId: string;
  rider: Partial<User>;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  seatsBooked: number;
  agreedPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'HOLD' | 'CHARGED' | 'REFUNDED';
  stripePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type Message = {
  id: string;
  senderId: string;
  sender: Partial<User>;
  receiverId: string;
  receiver: Partial<User>;
  rideId?: string;
  rideRequestId?: string;
  content: string;
  sentAt: string;
  readAt?: string;
}

export type Rating = {
  id: string;
  bookingId: string;
  raterId: string;
  rater: Partial<User>;
  rateeId: string;
  ratee: Partial<User>;
  stars: number;
  review?: string;
  createdAt: string;
}

export type Conversation = {
  user: Partial<User>;
  lastMessage: Message;
  unreadCount: number;
}

export type AuthResponse = {
  token: string;
  user: User;
  message: string;
}

export type LocationSuggestion = {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
}

