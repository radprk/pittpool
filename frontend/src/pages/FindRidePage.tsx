import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ridesAPI, requestsAPI } from '../services/api';
import { useMapbox } from '../hooks/useMapbox';
import type { Ride } from '../types';
import RideCard from '../components/rides/RideCard';
import RequestForm from '../components/requests/RequestForm';

const FindRidePage = () => {
  const [tab, setTab] = useState<'browse' | 'request'>('browse');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const { data: rides, isLoading } = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      const response = await ridesAPI.getAll();
      return response.data.rides as Ride[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find a Ride</h1>

      {/* Tab Selector */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setTab('browse')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            tab === 'browse'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Browse Rides
        </button>
        <button
          onClick={() => setTab('request')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            tab === 'request'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Post Request
        </button>
      </div>

      {tab === 'browse' ? (
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading rides...</p>
            </div>
          ) : rides && rides.length > 0 ? (
            <div className="grid gap-4">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No rides available at the moment</p>
              <button
                onClick={() => setTab('request')}
                className="btn-primary"
              >
                Post a Ride Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!showRequestForm ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                Can't find a ride? Post a request and let drivers come to you!
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="btn-primary"
              >
                Create Ride Request
              </button>
            </div>
          ) : (
            <RequestForm onClose={() => setShowRequestForm(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export default FindRidePage;

