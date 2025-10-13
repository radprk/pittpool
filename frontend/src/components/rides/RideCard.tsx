import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ride } from '../../types';
import { bookingsAPI } from '../../services/api';

interface RideCardProps {
  ride: Ride;
}

const RideCard = ({ ride }: RideCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [error, setError] = useState('');

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => bookingsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      alert('Booking request sent to driver!');
      setShowBookingForm(false);
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to create booking');
    },
  });

  const handleBooking = () => {
    setError('');
    createBookingMutation.mutate({
      rideId: ride.id,
      pickupLat: ride.startLat,
      pickupLng: ride.startLng,
      pickupAddress: ride.startAddress,
      dropoffLat: ride.endLat,
      dropoffLng: ride.endLng,
      dropoffAddress: ride.endAddress,
      seatsBooked: seatsToBook,
      agreedPrice: ride.pricePerSeat * seatsToBook,
    });
  };

  const remainingSeats = ride.remainingSeats ?? ride.availableSeats;

  return (
    <div className="card hover:shadow-lg transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">
                {ride.startAddress} → {ride.endAddress}
              </h3>
              <p className="text-gray-600 text-sm">
                {new Date(ride.departureTime).toLocaleDateString()} at{' '}
                {new Date(ride.departureTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            {ride.matchScore && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {Math.round(ride.matchScore * 100)}% match
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-2">👤</span>
              <div>
                <p className="font-medium">{ride.driver.name}</p>
                <p className="text-sm text-gray-600">
                  ⭐ {ride.driver.rating?.toFixed(1)} • {ride.driver.totalRides} rides
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>🪑 {remainingSeats} seats available</span>
            <span>💵 ${ride.pricePerSeat}/seat</span>
            <span>
              {ride.routeFlexibility === 'FLEXIBLE' ? '🔄 Flexible route' : '➡️ Direct route'}
            </span>
            {ride.driver.vehicleMake && (
              <span>
                🚗 {ride.driver.vehicleMake} {ride.driver.vehicleModel}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:w-32">
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="btn-primary text-sm"
            disabled={remainingSeats === 0}
          >
            {remainingSeats === 0 ? 'Full' : 'Book'}
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="btn-secondary text-sm"
          >
            Message
          </button>
        </div>
      </div>

      {showBookingForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of seats
              </label>
              <select
                value={seatsToBook}
                onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                className="input-field"
              >
                {Array.from({ length: Math.min(remainingSeats, 6) }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'seat' : 'seats'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Total Price</p>
              <p className="text-2xl font-bold text-primary-600">
                ${(ride.pricePerSeat * seatsToBook).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleBooking}
              disabled={createBookingMutation.isPending}
              className="flex-1 btn-primary"
            >
              {createBookingMutation.isPending ? 'Sending...' : 'Confirm Booking'}
            </button>
            <button
              onClick={() => setShowBookingForm(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideCard;

