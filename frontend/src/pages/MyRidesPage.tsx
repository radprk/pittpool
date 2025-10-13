import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ridesAPI, requestsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyRidesPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'rides' | 'requests' | 'bookings'>('rides');

  const { data: myRides, isLoading: ridesLoading } = useQuery({
    queryKey: ['myRides'],
    queryFn: async () => {
      const response = await ridesAPI.getMyRides();
      return response.data.rides;
    },
  });

  const { data: myRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const response = await requestsAPI.getMyRequests();
      return response.data.requests;
    },
  });

  const { data: myBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const response = await bookingsAPI.getMyBookings();
      return response.data.bookings;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Rides</h1>

      {/* Tab Selector */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setTab('rides')}
          className={`px-6 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            tab === 'rides'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Posted Rides
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-6 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            tab === 'requests'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Requests
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`px-6 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            tab === 'bookings'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Posted Rides */}
      {tab === 'rides' && (
        <div>
          {ridesLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : myRides && myRides.length > 0 ? (
            <div className="space-y-4">
              {myRides.map((ride: any) => (
                <div key={ride.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {ride.startAddress} → {ride.endAddress}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(ride.departureTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      ride.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      ride.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>🪑 {ride.availableSeats} seats • 💵 ${ride.pricePerSeat}/seat</p>
                  </div>

                  {ride.bookings && ride.bookings.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <p className="font-medium mb-2">Bookings ({ride.bookings.length}):</p>
                      {ride.bookings.map((booking: any) => (
                        <div key={booking.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{booking.rider.name}</p>
                            <p className="text-sm text-gray-600">
                              {booking.seatsBooked} seats • ${booking.agreedPrice}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't posted any rides yet</p>
              <a href="/post-ride" className="btn-primary inline-block">
                Post Your First Ride
              </a>
            </div>
          )}
        </div>
      )}

      {/* My Requests */}
      {tab === 'requests' && (
        <div>
          {requestsLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : myRequests && myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((request: any) => (
                <div key={request.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {request.pickupAddress} → {request.dropoffAddress}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(request.desiredTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      request.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'MATCHED' ? 'bg-green-100 text-green-800' :
                      request.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>🪑 {request.seatsNeeded} seats needed</p>
                    <p>⏰ Flexible ±{request.timeFlexibility} minutes</p>
                    {request.maxPrice && <p>💵 Max ${request.maxPrice}/seat</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't posted any ride requests yet</p>
              <a href="/find-ride" className="btn-primary inline-block">
                Create Ride Request
              </a>
            </div>
          )}
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div>
          {bookingsLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : myBookings && myBookings.length > 0 ? (
            <div className="space-y-4">
              {myBookings.map((booking: any) => (
                <div key={booking.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.pickupAddress} → {booking.dropoffAddress}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(booking.ride.departureTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium">Driver: {booking.ride.driver.name}</p>
                    <p className="text-sm text-gray-600">
                      ⭐ {booking.ride.driver.rating.toFixed(1)} • {booking.ride.driver.totalRides} rides
                    </p>
                    {booking.ride.driver.vehicleMake && (
                      <p className="text-sm text-gray-600">
                        🚗 {booking.ride.driver.vehicleMake} {booking.ride.driver.vehicleModel}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>🪑 {booking.seatsBooked} seats • 💵 ${booking.agreedPrice}</p>
                    <p>Payment: {booking.paymentStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You don't have any bookings yet</p>
              <a href="/find-ride" className="btn-primary inline-block">
                Find a Ride
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRidesPage;

