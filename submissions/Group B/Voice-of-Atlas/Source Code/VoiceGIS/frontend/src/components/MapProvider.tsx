'use client';

import dynamic from 'next/dynamic';
import { Map as LeafletMap } from 'leaflet';
import type { AmenityMarker, TrafficIncidentMarker } from '@/components/Map';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type MapProviderProps = {
  setMap: (map: LeafletMap) => void;
  markerPosition: { lat: number; lon: number } | null;
  amenityMarkers?: AmenityMarker[];
  trafficIncidentMarkers?: TrafficIncidentMarker[];
};

const MapProvider = ({ setMap, markerPosition, amenityMarkers = [], trafficIncidentMarkers = [] }: MapProviderProps) => {
  return (
    <Map
      setMap={setMap}
      markerPosition={markerPosition}
      amenityMarkers={amenityMarkers}
      trafficIncidentMarkers={trafficIncidentMarkers}
    />
  );
};

export default MapProvider;
