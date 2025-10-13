import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '../../services/api';
import { useMapbox } from '../../hooks/useMapbox';
import type { LocationSuggestion } from '../../types';

interface RequestFormProps {
  onClose: () => void;
}

const RequestForm = ({ onClose }: RequestFormProps) => {
  const queryClient = useQueryClient();
  const { searchAddress } = useMapbox();
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffAddress: '',
    dropoffLat: 0,
    dropoffLng: 0,
    desiredTime: '',
    timeFlexibility: 30,
    seatsNeeded: 1,
    maxPrice: '',
  });

  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([]);
  const [error, setError] = useState('');

  const createRequestMutation = useMutation({
    mutationFn: (data: any) => requestsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      alert('Ride request created! Drivers will be notified.');
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to create request');
    },
  });

  const handlePickupSearch = async (query: string) => {
    setFormData({ ...formData, pickupAddress: query });
    if (query.length >= 3) {
      const suggestions = await searchAddress(query);
      setPickupSuggestions(suggestions);
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDropoffSearch = async (query: string) => {
    setFormData({ ...formData, dropoffAddress: query });
    if (query.length >= 3) {
      const suggestions = await searchAddress(query);
      setDropoffSuggestions(suggestions);
    } else {
      setDropoffSuggestions([]);
    }
  };

  const selectPickupLocation = (suggestion: LocationSuggestion) => {
    setFormData({
      ...formData,
      pickupAddress: suggestion.place_name,
      pickupLng: suggestion.center[0],
      pickupLat: suggestion.center[1],
    });
    setPickupSuggestions([]);
  };

  const selectDropoffLocation = (suggestion: LocationSuggestion) => {
    setFormData({
      ...formData,
      dropoffAddress: suggestion.place_name,
      dropoffLng: suggestion.center[0],
      dropoffLat: suggestion.center[1],
    });
    setDropoffSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.pickupLat || !formData.dropoffLat) {
      setError('Please select valid locations from the suggestions');
      return;
    }

    createRequestMutation.mutate(formData);
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Ride Request</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Pickup Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <input
            type="text"
            value={formData.pickupAddress}
            onChange={(e) => handlePickupSearch(e.target.value)}
            className="input-field"
            placeholder="Enter pickup address..."
            required
          />
          {pickupSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              {pickupSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => selectPickupLocation(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  {suggestion.place_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropoff Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dropoff Location
          </label>
          <input
            type="text"
            value={formData.dropoffAddress}
            onChange={(e) => handleDropoffSearch(e.target.value)}
            className="input-field"
            placeholder="Enter dropoff address..."
            required
          />
          {dropoffSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              {dropoffSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => selectDropoffLocation(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  {suggestion.place_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desired Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired Time
          </label>
          <input
            type="datetime-local"
            value={formData.desiredTime}
            onChange={(e) => setFormData({ ...formData, desiredTime: e.target.value })}
            className="input-field"
            required
          />
        </div>

        {/* Time Flexibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Flexibility (±{formData.timeFlexibility} minutes)
          </label>
          <input
            type="range"
            min="0"
            max="120"
            step="15"
            value={formData.timeFlexibility}
            onChange={(e) => setFormData({ ...formData, timeFlexibility: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Seats Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seats Needed
          </label>
          <select
            value={formData.seatsNeeded}
            onChange={(e) => setFormData({ ...formData, seatsNeeded: parseInt(e.target.value) })}
            className="input-field"
            required
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'seat' : 'seats'}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Price Per Seat (optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.maxPrice}
            onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
            className="input-field"
            placeholder="0.00"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={createRequestMutation.isPending}
            className="flex-1 btn-primary"
          >
            {createRequestMutation.isPending ? 'Creating...' : 'Create Request'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;

