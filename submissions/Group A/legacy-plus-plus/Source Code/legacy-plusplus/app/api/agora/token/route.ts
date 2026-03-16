import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from "agora-token";
import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function POST(req: NextRequest) {
  const { channelName, uid } = await req.json();

  if (!channelName || uid === undefined) {
    return NextResponse.json(
      { error: "channelName and uid are required" },
      { status: 400 }
    );
  }

  if (!APP_ID || !APP_CERTIFICATE) {
    return NextResponse.json(
      { error: "Agora credentials not configured" },
      { status: 500 }
    );
  }

  // Token valid for 1 hour
  const expirationSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs,
    privilegeExpiredTs
  );

  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    String(uid),
    privilegeExpiredTs
  );

  return NextResponse.json({ token, rtmToken });
}
