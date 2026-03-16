'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

import { Map as LeafletMap } from 'leaflet';

export type AmenityMarker = { lat: number; lon: number; name?: string };

export type TrafficIncidentMarker = { lat: number; lon: number; description?: string; iconCategory?: number };

const MapEvents = ({ setMap }: { setMap: (map: LeafletMap) => void }) => {
  const map = useMap();
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
};

const FitAmenityBounds = ({ markers }: { markers: AmenityMarker[] }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lon], 14);
      return;
    }
    const bounds = L.latLngBounds(
      markers.map((m) => [m.lat, m.lon] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, markers]);
  return null;
};

const yellowMarkerIcon = L.divIcon({
  className: 'yellow-marker',
  html: `<div style="
    width: 18px;
    height: 18px;
    background: #EAB308;
    border: 2px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

const amenityMarkerIcon = L.divIcon({
  className: 'amenity-marker',
  html: `<div style="
    width: 12px;
    height: 12px;
    background: #3B82F6;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const trafficIncidentIcon = L.divIcon({
  className: 'traffic-incident-marker',
  html: `<div style="
    width: 14px;
    height: 14px;
    background: #DC2626;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const FitTrafficIncidentBounds = ({ markers }: { markers: TrafficIncidentMarker[] }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lon], 14);
      return;
    }
    const bounds = L.latLngBounds(
      markers.map((m) => [m.lat, m.lon] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, markers]);
  return null;
};

type MapProps = {
  setMap: (map: LeafletMap) => void;
  markerPosition: { lat: number; lon: number } | null;
  amenityMarkers?: AmenityMarker[];
  trafficIncidentMarkers?: TrafficIncidentMarker[];
};

const Map = ({ setMap, markerPosition, amenityMarkers = [], trafficIncidentMarkers = [] }: MapProps) => {
  return (
    <MapContainer center={[14.5995, 120.9842]} zoom={10} style={{ height: '100vh', width: '100vw', zIndex: 0 }} zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markerPosition && (
        <Marker
          position={[markerPosition.lat, markerPosition.lon]}
          icon={yellowMarkerIcon}
        />
      )}
      {amenityMarkers.map((m, i) => (
        <Marker key={`amenity-${m.lat}-${m.lon}-${i}`} position={[m.lat, m.lon]} icon={amenityMarkerIcon}>
          {m.name && <Popup>{m.name}</Popup>}
        </Marker>
      ))}
      {trafficIncidentMarkers.map((m, i) => (
        <Marker key={`incident-${m.lat}-${m.lon}-${i}`} position={[m.lat, m.lon]} icon={trafficIncidentIcon}>
          {m.description && <Popup>{m.description}</Popup>}
        </Marker>
      ))}
      {amenityMarkers.length > 0 && <FitAmenityBounds markers={amenityMarkers} />}
      {trafficIncidentMarkers.length > 0 && <FitTrafficIncidentBounds markers={trafficIncidentMarkers} />}
      <MapEvents setMap={setMap} />
    </MapContainer>
  );
};

export default Map;
