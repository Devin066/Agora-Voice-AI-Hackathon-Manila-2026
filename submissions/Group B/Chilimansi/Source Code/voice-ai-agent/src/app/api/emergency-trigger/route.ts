import { NextResponse } from "next/server";

type EmergencyPayload = {
  incidentType?: string;
  latitude?: number;
  longitude?: number;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as EmergencyPayload;

  return NextResponse.json({
    ok: true,
    incidentId: crypto.randomUUID(),
    trigger: {
      incidentType: payload.incidentType ?? "unknown",
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      timestamp: new Date().toISOString(),
    },
    lambdaCompatibility: {
      runtime: "nodejs",
      status: "compatible-with-nextjs-route-handlers",
    },
    integrations: {
      awsBedrock: "placeholder",
      elevenLabs: "placeholder",
    },
  });
}
