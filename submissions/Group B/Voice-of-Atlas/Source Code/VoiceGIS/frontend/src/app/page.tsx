'use client';

import { useState, useCallback } from 'react';
import Map from '@/components/MapProvider';
import LocationSearchBar from '@/components/LocationSearchBar';
import ChatBar from '@/components/ChatBar';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Map as LeafletMap } from 'leaflet';
import type { AmenityMarker, TrafficIncidentMarker } from '@/components/Map';

const GEOAPIFY_AUTOCOMPLETE = 'https://api.geoapify.com/v1/geocode/autocomplete';
const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export default function Home() {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [amenityMarkers, setAmenityMarkers] = useState<AmenityMarker[]>([]);
  const [trafficIncidentMarkers, setTrafficIncidentMarkers] = useState<TrafficIncidentMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);

  const handleReset = () => {
    map?.setView([14.5995, 120.9842], 10);
    setMarkerPosition(null);
    setAmenityMarkers([]);
    setTrafficIncidentMarkers([]);
    setSearchQuery('');
  };

  const handleLocationSearchFromChatOrVoice = useCallback(
    async (query: string) => {
      if (!API_KEY || !map) throw new Error('Search not available');
      const params = new URLSearchParams({
        text: query.trim(),
        format: 'json',
        apiKey: API_KEY,
        limit: '1',
      });
      const res = await fetch(`${GEOAPIFY_AUTOCOMPLETE}?${params}`);
      const data = await res.json();
      const results = data.results || [];
      if (results.length === 0) throw new Error('Place not found');
      const first = results[0];
      const lat = first.lat;
      const lon = first.lon;
      const formatted = first.formatted || first.address_line1 || query;
      setAmenityMarkers([]);
      setMarkerPosition({ lat, lon });
      setSearchQuery(formatted);
      map.flyTo([lat, lon], 14, { duration: 0.8 });
    },
    [map]
  );

  const handleShowAmenitiesInPlace = useCallback(
    async (amenityKey: string, placeQuery: string) => {
      const res = await fetch('/api/overpass/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place: placeQuery, amenity: amenityKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load amenities');
      const places: AmenityMarker[] = data.places ?? [];
      setMarkerPosition(null);
      setTrafficIncidentMarkers([]);
      setAmenityMarkers(places);
      setSearchQuery('');
    },
    []
  );

  const handleShowTrafficIncidents = useCallback(async () => {
    if (!map) throw new Error('Map not ready');
    const bounds = map.getBounds();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();
    const res = await fetch('/api/tomtom/traffic-incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ south, west, north, east }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load traffic incidents');
    const incidents: TrafficIncidentMarker[] = data.incidents ?? [];
    setTrafficIncidentMarkers(incidents);
    setAmenityMarkers([]);
  }, [map]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white">
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center">
        <Map setMap={setMap} markerPosition={markerPosition} amenityMarkers={amenityMarkers} trafficIncidentMarkers={trafficIncidentMarkers} />

        {/* Location search — top left */}
        <LocationSearchBar map={map} onLocationSelect={setMarkerPosition} value={searchQuery} onQueryChange={setSearchQuery} />

        {/* Zoom and refresh controls */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform space-y-1.5 z-10">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 bg-opacity-75" onClick={() => map?.zoomIn()}>
            <ZoomIn size={16} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 bg-opacity-75" onClick={() => map?.zoomOut()}>
            <ZoomOut size={16} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 bg-opacity-75" onClick={handleReset} aria-label="Reset map and clear search">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Bottom chat/voice bar */}
        <ChatBar voiceMode={voiceMode} onVoiceModeChange={setVoiceMode} map={map} onLocationSearch={handleLocationSearchFromChatOrVoice} onShowAmenities={handleShowAmenitiesInPlace} onShowTrafficIncidents={handleShowTrafficIncidents} onReset={handleReset} />
      </main>
    </div>
  );
}
