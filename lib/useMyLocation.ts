import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { CITY_CENTER, type LatLng } from './geo';

export type LocationState = {
  coords: LatLng;
  precise: boolean; // false = the city fallback, not the device
  loading: boolean;
  denied: boolean;
  request: () => void; // ask again after the user turns it on
};

// Ask once on mount, use the device position if granted, otherwise fall back to
// the city centre so the map and the dispatch still work. Never blocks a flow.
export function useMyLocation(): LocationState {
  const [state, setState] = useState({
    coords: CITY_CENTER,
    precise: false,
    loading: true,
    denied: false,
  });

  const read = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ coords: CITY_CENTER, precise: false, loading: false, denied: true });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setState({
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        precise: true,
        loading: false,
        denied: false,
      });
    } catch {
      setState({ coords: CITY_CENTER, precise: false, loading: false, denied: true });
    }
  }, []);

  useEffect(() => {
    let alive = true;
    read().catch(() => {
      if (alive) setState({ coords: CITY_CENTER, precise: false, loading: false, denied: true });
    });
    return () => {
      alive = false;
    };
  }, [read]);

  return { ...state, request: () => void read() };
}
