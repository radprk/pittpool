import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ridesAPI, requestsAPI, bookingsAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: myRides } = useQuery({
    queryKey: ['myRides'],
    queryFn: async () => {
      const response = await ridesAPI.getMyRides();
      return response.data.rides;
    },
  });

  const { data: myRequests } = useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const response = await requestsAPI.getMyRequests();
      return response.data.requests;
    },
  });

  const { data: myBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const response = await bookingsAPI.getMyBookings();
      return response.data.bookings;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          ⭐ {user?.rating.toFixed(1)} rating • {user?.totalRides} rides completed
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link to="/find-ride" className="card hover:shadow-lg transition">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Find a Ride</h3>
          <p className="text-gray-600">
            Search for available rides or post a ride request
          </p>
        </Link>

        <Link to="/post-ride" className="card hover:shadow-lg transition">
          <div className="text-4xl mb-3">🚗</div>
          <h3 className="text-xl font-semibold mb-2">Post a Ride</h3>
          <p className="text-gray-600">
            Offer a ride and earn money while helping others
          </p>
        </Link>

        <Link to="/messages" className="card hover:shadow-lg transition">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-xl font-semibold mb-2">Messages</h3>
          <p className="text-gray-600">
            Chat with other users about your trips
          </p>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Active Rides */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Active Rides</h2>
          {myRides && myRides.length > 0 ? (
            <div className="space-y-4">
              {myRides.slice(0, 3).map((ride: any) => (
                <div key={ride.id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">
                        {ride.startAddress} → {ride.endAddress}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(ride.departureTime).toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {ride.availableSeats} seats • ${ride.pricePerSeat}/seat
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No active rides</p>
          )}
        </div>

        {/* Active Requests */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Ride Requests</h2>
          {myRequests && myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.slice(0, 3).map((request: any) => (
                <div key={request.id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">
                        {request.pickupAddress} → {request.dropoffAddress}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(request.desiredTime).toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {request.seatsNeeded} seats needed
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No active requests</p>
          )}
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
          {myBookings && myBookings.length > 0 ? (
            <div className="space-y-4">
              {myBookings.slice(0, 3).map((booking: any) => (
                <div key={booking.id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">
                        {booking.pickupAddress} → {booking.dropoffAddress}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Driver: {booking.ride.driver.name} ({booking.ride.driver.rating.toFixed(1)}⭐)
                      </p>
                      <p className="text-gray-600 text-sm">
                        {booking.seatsBooked} seats • ${booking.agreedPrice}
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

