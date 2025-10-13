import { useState } from 'react';
import type { LocationSuggestion } from '../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const useMapbox = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddress = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 3) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Pittsburgh bounding box and proximity
      const bbox = '-80.2,40.3,-79.8,40.6';
      const proximity = '-79.9959,40.4406'; // Pittsburgh center

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&proximity=${proximity}&bbox=${bbox}&limit=5`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();

      const suggestions: LocationSuggestion[] = data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center,
        text: feature.text,
      }));

      return suggestions;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { searchAddress, loading, error };
};

