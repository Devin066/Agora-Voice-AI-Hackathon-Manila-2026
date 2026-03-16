import { NextRequest, NextResponse } from 'next/server';

// Dynamic import so we only load on server (agora-access-token is Node-only)
async function getTokenBuilder() {
  const { RtcTokenBuilder, RtcRole } = await import('agora-access-token');
  return { RtcTokenBuilder, RtcRole };
}

export async function GET(req: NextRequest) {
  const appId = process.env.AGORA_APP_ID;
  const certificate = process.env.AGORA_APP_CERTIFICATE;
  if (!appId || !certificate) {
    return NextResponse.json(
      { error: 'AGORA_APP_ID and AGORA_APP_CERTIFICATE must be set' },
      { status: 500 }
    );
  }
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel');
  const uid = searchParams.get('uid');
  if (!channel || !uid) {
    return NextResponse.json({ error: 'channel and uid required' }, { status: 400 });
  }
  try {
    const { RtcTokenBuilder, RtcRole } = await getTokenBuilder();
    const uidNum = parseInt(uid, 10);
    if (Number.isNaN(uidNum) || uidNum < 0) {
      return NextResponse.json({ error: 'uid must be a non-negative integer' }, { status: 400 });
    }
    const expiration = 3600; // 1 hour
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpired = currentTime + expiration;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      certificate,
      channel,
      uidNum,
      RtcRole.PUBLISHER,
      privilegeExpired
    );
    return NextResponse.json({ token, uid: uidNum });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Token generation failed' },
      { status: 500 }
    );
  }
}
