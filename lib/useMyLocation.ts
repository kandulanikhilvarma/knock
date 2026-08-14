import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { CITY_CENTER, type LatLng } from './geo';

export type LocationState = {
  coords: LatLng;
  precise: boolean; // false = the city fallback, not the device
  loading: boolean;
};

// Ask once, use the device position if granted, otherwise fall back to the city
// centre so the map and the dispatch still work. Never blocks the flow.
export function useMyLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    coords: CITY_CENTER,
    precise: false,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('denied');
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!alive) return;
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          precise: true,
          loading: false,
        });
      } catch {
        if (alive) setState({ coords: CITY_CENTER, precise: false, loading: false });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
