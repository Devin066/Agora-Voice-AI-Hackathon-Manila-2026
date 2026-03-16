import { NextRequest, NextResponse } from 'next/server';

const GEOAPIFY_SEARCH = 'https://api.geoapify.com/v1/geocode/search';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

/** Map frontend amenity key to OSM amenity tag value(s) for Overpass regex. */
const AMENITY_OSM: Record<string, string> = {
  health: 'hospital|clinic|pharmacy|doctors',
  health_facilities: 'hospital|clinic|pharmacy|doctors',
  hospitals: 'hospital',
  clinics: 'clinic',
  pharmacy: 'pharmacy',
  pharmacies: 'pharmacy',
  police: 'police',
  schools: 'school|university|college',
  restaurants: 'restaurant|fast_food',
  banks: 'bank',
  atms: 'atm',
  fuel: 'fuel',
  parking: 'parking',
};

function getOsmAmenityRegex(amenityKey: string): string {
  const key = amenityKey.toLowerCase().trim().replace(/\s+/g, '_');
  return AMENITY_OSM[key] ?? key.replace(/_/g, '|');
}

/** Geocode place and return bbox [south, west, north, east]. */
async function geocodeToBbox(place: string, apiKey: string): Promise<[number, number, number, number]> {
  const params = new URLSearchParams({
    text: place.trim(),
    format: 'json',
    apiKey,
    limit: '1',
  });
  const res = await fetch(`${GEOAPIFY_SEARCH}?${params}`);
  const data = await res.json();
  // Support both Geoapify "results" and GeoJSON "features"
  const results = data.results || data.features || [];
  if (results.length === 0) throw new Error('Place not found');
  const first = results[0];
  let lat: number;
  let lon: number;
  let bbox = first.bbox || first.bbox32;
  if (first.geometry?.coordinates) {
    const [lon0, lat0] = first.geometry.coordinates;
    lon = lon0;
    lat = lat0;
  } else {
    lat = first.lat ?? first.properties?.lat;
    lon = first.lon ?? first.properties?.lon;
  }
  if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error('Place not found');
  // GeoJSON bbox is [west, south, east, north]
  let southOut: number;
  let westOut: number;
  let northOut: number;
  let eastOut: number;
  if (Array.isArray(bbox) && bbox.length >= 4) {
    const [west, south, east, north] = bbox;
    southOut = south;
    westOut = west;
    northOut = north;
    eastOut = east;
  } else {
    // Fallback: use result rank/type for radius. Cap delta so Overpass doesn't timeout on huge areas (e.g. whole country).
    const rank = first.rank?.confidence ?? 0;
    const type = (first.result_type || first.type || first.properties?.result_type || '').toLowerCase();
    const MAX_DELTA = 2;
    let delta = 1;
    if (type.includes('country') || rank < 0.3) delta = 2;
    else if (type.includes('state') || type.includes('region')) delta = 1.5;
    else if (type.includes('city') || type.includes('town')) delta = 0.5;
    else delta = 0.3;
    delta = Math.min(delta, MAX_DELTA);
    southOut = lat - delta;
    westOut = lon - delta;
    northOut = lat + delta;
    eastOut = lon + delta;
  }
  // Clamp bbox size so Overpass doesn't timeout: max ~2 deg each side (~220 km at mid-lat)
  const MAX_DELTA_DEG = 2;
  const latSpan = northOut - southOut;
  const lonSpan = eastOut - westOut;
  if (latSpan > MAX_DELTA_DEG || lonSpan > MAX_DELTA_DEG) {
    const latCenter = (southOut + northOut) / 2;
    const lonCenter = (westOut + eastOut) / 2;
    const halfLat = Math.min(latSpan / 2, MAX_DELTA_DEG / 2);
    const halfLon = Math.min(lonSpan / 2, MAX_DELTA_DEG / 2);
    southOut = latCenter - halfLat;
    westOut = lonCenter - halfLon;
    northOut = latCenter + halfLat;
    eastOut = lonCenter + halfLon;
  }
  return [southOut, westOut, northOut, eastOut];
}

/** Query Overpass for nodes/ways with amenity in bbox; return { lat, lon, name }[]. */
const MAX_AMENITY_RESULTS = 300;

async function queryOverpass(
  south: number,
  west: number,
  north: number,
  east: number,
  amenityRegex: string
): Promise<{ lat: number; lon: number; name?: string }[]> {
  const query = `[out:json][timeout:25];
(node["amenity"~"${amenityRegex}"](${south},${west},${north},${east});
 way["amenity"~"${amenityRegex}"](${south},${west},${north},${east});
);
out center body;
`;
  const res = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  const data = await res.json();
  const elements = data.elements || [];
  const places: { lat: number; lon: number; name?: string }[] = [];
  for (const el of elements) {
    if (places.length >= MAX_AMENITY_RESULTS) break;
    let lat: number;
    let lon: number;
    if (el.type === 'node') {
      lat = el.lat;
      lon = el.lon;
    } else if (el.type === 'way' && el.center) {
      lat = el.center.lat;
      lon = el.center.lon;
    } else continue;
    const name = el.tags?.name ?? undefined;
    places.push({ lat, lon, name });
  }
  return places;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_GEOAPIFY_API_KEY not set' }, { status: 500 });
  }
  let body: { place?: string; amenity?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const placeRaw = typeof body.place === 'string' ? body.place.trim() : '';
  const place = placeRaw.replace(/^\s*the\s+/i, '').trim() || placeRaw;
  const amenityKey = typeof body.amenity === 'string' ? body.amenity.trim() : '';
  if (!place || !amenityKey) {
    return NextResponse.json(
      { error: 'Body must include place and amenity (e.g. { "place": "Philippines", "amenity": "health" })' },
      { status: 400 }
    );
  }
  try {
    const [south, west, north, east] = await geocodeToBbox(place, apiKey);
    const osmRegex = getOsmAmenityRegex(amenityKey);
    const places = await queryOverpass(south, west, north, east, osmRegex);
    return NextResponse.json({ places, bbox: [south, west, north, east] });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Overpass or geocode failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
