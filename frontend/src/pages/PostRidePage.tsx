import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ridesAPI } from '../services/api';
import { useMapbox } from '../hooks/useMapbox';
import type { LocationSuggestion } from '../types';

const PostRidePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { searchAddress } = useMapbox();
  
  const [formData, setFormData] = useState({
    startAddress: '',
    startLat: 0,
    startLng: 0,
    endAddress: '',
    endLat: 0,
    endLng: 0,
    departureTime: '',
    availableSeats: 1,
    pricePerSeat: '',
    routeFlexibility: 'FLEXIBLE',
  });

  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<LocationSuggestion[]>([]);
  const [error, setError] = useState('');

  const createRideMutation = useMutation({
    mutationFn: (data: any) => ridesAPI.create(data),
    onSuccess: () => {
      // Invalidate rides cache so new ride shows up immediately
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['myRides'] });
      navigate('/my-rides');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to create ride');
    },
  });

  const handleStartAddressSearch = async (query: string) => {
    setFormData({ ...formData, startAddress: query });
    if (query.length >= 3) {
      const suggestions = await searchAddress(query);
      setStartSuggestions(suggestions);
    } else {
      setStartSuggestions([]);
    }
  };

  const handleEndAddressSearch = async (query: string) => {
    setFormData({ ...formData, endAddress: query });
    if (query.length >= 3) {
      const suggestions = await searchAddress(query);
      setEndSuggestions(suggestions);
    } else {
      setEndSuggestions([]);
    }
  };

  const selectStartLocation = (suggestion: LocationSuggestion) => {
    setFormData({
      ...formData,
      startAddress: suggestion.place_name,
      startLng: suggestion.center[0],
      startLat: suggestion.center[1],
    });
    setStartSuggestions([]);
  };

  const selectEndLocation = (suggestion: LocationSuggestion) => {
    setFormData({
      ...formData,
      endAddress: suggestion.place_name,
      endLng: suggestion.center[0],
      endLat: suggestion.center[1],
    });
    setEndSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.startLat || !formData.endLat) {
      setError('Please select valid locations from the suggestions');
      return;
    }

    createRideMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Post a Ride</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Start Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting Location
          </label>
          <input
            type="text"
            value={formData.startAddress}
            onChange={(e) => handleStartAddressSearch(e.target.value)}
            className="input-field"
            placeholder="Enter starting address..."
            required
          />
          {startSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              {startSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => selectStartLocation(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  {suggestion.place_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* End Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <input
            type="text"
            value={formData.endAddress}
            onChange={(e) => handleEndAddressSearch(e.target.value)}
            className="input-field"
            placeholder="Enter destination address..."
            required
          />
          {endSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              {endSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => selectEndLocation(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  {suggestion.place_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Departure Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departure Time
          </label>
          <input
            type="datetime-local"
            value={formData.departureTime}
            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
            className="input-field"
            required
          />
        </div>

        {/* Available Seats */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Seats
          </label>
          <select
            value={formData.availableSeats}
            onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
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

        {/* Price Per Seat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Per Seat ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.pricePerSeat}
            onChange={(e) => setFormData({ ...formData, pricePerSeat: e.target.value })}
            className="input-field"
            placeholder="0.00"
            required
          />
        </div>

        {/* Route Flexibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Route Flexibility
          </label>
          <select
            value={formData.routeFlexibility}
            onChange={(e) => setFormData({ ...formData, routeFlexibility: e.target.value })}
            className="input-field"
          >
            <option value="FLEXIBLE">Flexible (can make detours)</option>
            <option value="RIGID">Rigid (direct route only)</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={createRideMutation.isPending}
            className="flex-1 btn-primary"
          >
            {createRideMutation.isPending ? 'Posting...' : 'Post Ride'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostRidePage;

