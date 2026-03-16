import { NextRequest, NextResponse } from 'next/server';

const TOMTOM_BASE = 'https://api.tomtom.com/traffic/services/5/incidentDetails';

/** TomTom bbox = minLon, minLat, maxLon, maxLat. Max area 10,000 km². */
type TomTomBbox = [number, number, number, number];

// TomTom limit is 10,000 km²; use 9,000 to stay clear of rounding/geodesic differences.
const MAX_BBOX_AREA_KM2 = 9_000;

/** Approximate area of bbox in km² (WGS84, mid-lat). Conservative so clamped box stays under TomTom's limit. */
function bboxAreaKm2(south: number, west: number, north: number, east: number): number {
  const latMid = (south + north) / 2;
  const kmPerDegLat = 111;
  const kmPerDegLon = 111 * Math.cos((latMid * Math.PI) / 180);
  const h = (north - south) * kmPerDegLat;
  const w = (east - west) * kmPerDegLon;
  return h * w;
}

/** Clamp bbox to max area by shrinking around center. */
function clampBboxToMaxArea(
  south: number,
  west: number,
  north: number,
  east: number,
  maxAreaKm2: number
): [number, number, number, number] {
  const area = bboxAreaKm2(south, west, north, east);
  if (area <= maxAreaKm2) return [south, west, north, east];
  const ratio = Math.sqrt(maxAreaKm2 / area);
  const latCenter = (south + north) / 2;
  const lonCenter = (west + east) / 2;
  const halfLat = ((north - south) / 2) * ratio;
  const halfLon = ((east - west) / 2) * ratio;
  return [
    latCenter - halfLat,
    lonCenter - halfLon,
    latCenter + halfLat,
    lonCenter + halfLon,
  ];
}

function toTomTomBbox(south: number, west: number, north: number, east: number): TomTomBbox {
  return [west, south, east, north];
}

export type TrafficIncidentMarker = { lat: number; lon: number; description?: string; iconCategory?: number };

/** Extract first point from geometry (Point or LineString) as [lat, lon]. */
function getIncidentPoint(incident: {
  geometry?: { type?: string; coordinates?: number[] | number[][] };
}): { lat: number; lon: number } | null {
  const geom = incident.geometry;
  if (!geom || !geom.coordinates) return null;
  const coords = geom.coordinates;
  if (geom.type === 'Point' && Array.isArray(coords) && coords.length >= 2) {
    const [lon, lat] = coords as number[];
    return { lat, lon };
  }
  if (geom.type === 'LineString' && Array.isArray(coords) && coords.length > 0) {
    const first = coords[0];
    if (Array.isArray(first) && first.length >= 2) {
      const [lon, lat] = first;
      return { lat, lon };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.TOMTOM_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'TOMTOM_API_KEY not set in .env.local' }, { status: 500 });
  }
  let body: { south?: number; west?: number; north?: number; east?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { south, west, north, east } = body;
  if (
    typeof south !== 'number' ||
    typeof west !== 'number' ||
    typeof north !== 'number' ||
    typeof east !== 'number'
  ) {
    return NextResponse.json(
      { error: 'Body must include south, west, north, east (numbers)' },
      { status: 400 }
    );
  }
  const [s2, w2, n2, e2] = clampBboxToMaxArea(south, west, north, east, MAX_BBOX_AREA_KM2);
  const bbox = toTomTomBbox(s2, w2, n2, e2);
  const bboxStr = bbox.join(',');
  // TomTom docs: use exact fields format from their example (evaluation keys may reject extra sub-fields).
  const fieldsStr = '{incidents{type,geometry{type,coordinates},properties{iconCategory}}}';
  const params = new URLSearchParams({
    key: apiKey,
    bbox: bboxStr,
    fields: fieldsStr,
    language: 'en-GB',
    timeValidityFilter: 'present',
  });
  const url = `${TOMTOM_BASE}?${params.toString()}`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' } });
    const data = await res.json();
    if (!res.ok) {
      const msg =
        (data && (data.error?.description || data.message || data.details || JSON.stringify(data))) ||
        `TomTom API error: ${res.status}`;
      return NextResponse.json(
        { error: msg },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }
    const incidents = data.incidents || [];
    const markers: TrafficIncidentMarker[] = [];
    const categoryLabels: Record<number, string> = {
      0: 'Unknown', 1: 'Accident', 2: 'Fog', 3: 'Dangerous conditions', 4: 'Rain',
      5: 'Ice', 6: 'Jam', 7: 'Lane closed', 8: 'Road closed', 9: 'Road works',
      10: 'Wind', 11: 'Flooding', 14: 'Broken down vehicle',
    };
    for (const inc of incidents) {
      const point = getIncidentPoint(inc);
      if (!point) continue;
      const iconCategory = inc.properties?.iconCategory;
      const desc = inc.properties?.events?.[0]?.description ?? (iconCategory !== undefined ? categoryLabels[iconCategory] ?? `Incident (${iconCategory})` : 'Traffic incident');
      markers.push({
        lat: point.lat,
        lon: point.lon,
        description: desc,
        iconCategory,
      });
    }
    return NextResponse.json({ incidents: markers });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'TomTom request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
