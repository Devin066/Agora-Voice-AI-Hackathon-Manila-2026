import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type { IAgoraRTCClient, IMicrophoneAudioTrack, ILocalVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

type DataStreamCapableClient = IAgoraRTCClient & {
  createDataStream?: (options: { ordered: boolean; syncWithAudio: boolean }) => Promise<number>;
  sendStreamMessage?: (streamId: number, data: Uint8Array) => Promise<void>;
};

const APP_ID = import.meta.env.VITE_AGORA_APP_ID || '';
const CHANNEL = import.meta.env.VITE_AGORA_CHANNEL || 'visionvoice';
const TOKEN = import.meta.env.VITE_AGORA_TOKEN || null;
const BACKEND_BASE_URL = (import.meta.env.VITE_LOCAL_AI_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const DEFAULT_UID = 1;

type TokenResponse = {
  token?: string;
  appId?: string;
  channel?: string;
  uid?: number;
};

type AgentStartResponse = {
  agent_id?: string;
};

export const useAgora = (shouldPlayAgentAudio: boolean = true) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVideoPublished, setIsVideoPublished] = useState(false);
  const [hasAgentAudio, setHasAgentAudio] = useState(false);
  const [isAgentSessionReady, setIsAgentSessionReady] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [lastSentContext, setLastSentContext] = useState('');
  const streamIdRef = useRef<number | null>(null);
  const previewElementRef = useRef<HTMLVideoElement | null>(null);
  const agentIdRef = useRef<string | null>(null);
  const remoteAudioTracksRef = useRef<Map<number, IRemoteAudioTrack>>(new Map());

  const fetchRtcSession = useCallback(async () => {
    if (!BACKEND_BASE_URL) {
      return {
        appId: APP_ID,
        channel: CHANNEL,
        token: TOKEN,
        uid: DEFAULT_UID,
      } satisfies TokenResponse;
    }

    const response = await fetch(
      `${BACKEND_BASE_URL}/token?channel=${encodeURIComponent(CHANNEL)}&uid=${DEFAULT_UID}`,
    );

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TokenResponse;
    return {
      appId: data.appId || APP_ID,
      channel: data.channel || CHANNEL,
      token: data.token || TOKEN,
      uid: typeof data.uid === 'number' ? data.uid : DEFAULT_UID,
    } satisfies TokenResponse;
  }, []);

  const startAgentSession = useCallback(async (channel: string, uid: number) => {
    if (!BACKEND_BASE_URL) {
      return null;
    }

    const response = await fetch(`${BACKEND_BASE_URL}/agent/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        userId: String(uid),
      }),
    });

    const data = (await response.json()) as AgentStartResponse & { error?: string; details?: unknown };
    if (!response.ok) {
      throw new Error(data.error || 'Agent start failed.');
    }

    return data.agent_id || null;
  }, []);

  const stopAgentSession = useCallback(async () => {
    if (!BACKEND_BASE_URL || !agentIdRef.current) return;

    try {
      await fetch(`${BACKEND_BASE_URL}/agent/${encodeURIComponent(agentIdRef.current)}/stop`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Failed to stop Agora agent session:', error);
    } finally {
      agentIdRef.current = null;
    }
  }, []);

  const attachPreview = useCallback((element: HTMLVideoElement | null) => {
    previewElementRef.current = element;
    if (element && localVideoTrack) {
      localVideoTrack.play(element);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    let isMounted = true;
    let createdAudioTrack: IMicrophoneAudioTrack | null = null;
    let createdVideoTrack: ILocalVideoTrack | null = null;
    let createdClient: IAgoraRTCClient | null = null;

    const initAgora = async () => {
      try {
        setConnectionError(null);
        setAgentError(null);
        setIsAgentSessionReady(false);

        const session = await fetchRtcSession();
        const resolvedAppId = session.appId || APP_ID;
        const resolvedChannel = session.channel || CHANNEL;
        const resolvedToken = session.token || TOKEN;
        const resolvedUid = session.uid ?? DEFAULT_UID;

        if (!resolvedAppId) {
          throw new Error('Missing Agora APP ID.');
        }

        const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        createdClient = agoraClient;
        const dataClient = agoraClient as DataStreamCapableClient;

        agoraClient.on('user-published', async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);

          if (mediaType === 'audio') {
            if (user.audioTrack) {
              remoteAudioTracksRef.current.set(Number(user.uid), user.audioTrack);
              if (shouldPlayAgentAudio) {
                user.audioTrack.play();
              } else {
                user.audioTrack.stop();
              }
            }
            if (isMounted) {
              setHasAgentAudio(true);
            }
          }

          if (isMounted) {
            setRemoteUsers((prev) => Array.from(new Set([...prev, Number(user.uid)])));
          }
        });

        agoraClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio' && isMounted) {
            remoteAudioTracksRef.current.get(Number(user.uid))?.stop();
            remoteAudioTracksRef.current.delete(Number(user.uid));
            setHasAgentAudio(false);
          }
          if (isMounted) {
            setRemoteUsers((prev) => prev.filter((uid) => uid !== Number(user.uid)));
          }
        });

        agoraClient.on('user-left', (user) => {
          remoteAudioTracksRef.current.get(Number(user.uid))?.stop();
          remoteAudioTracksRef.current.delete(Number(user.uid));
          if (isMounted) {
            setRemoteUsers((prev) => prev.filter((uid) => uid !== Number(user.uid)));
            setHasAgentAudio(false);
          }
        });

        await agoraClient.join(resolvedAppId, resolvedChannel, resolvedToken, resolvedUid);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        createdAudioTrack = audioTrack;
        createdVideoTrack = videoTrack;

        if (!isMounted) {
          audioTrack.close();
          videoTrack.close();
          await agoraClient.leave();
          return;
        }

        await agoraClient.publish([audioTrack]);

        try {
          const agentId = await startAgentSession(resolvedChannel, resolvedUid);
          if (!isMounted) {
            if (agentId) {
              agentIdRef.current = agentId;
              await stopAgentSession();
            }
            return;
          }
          agentIdRef.current = agentId;
          setIsAgentSessionReady(true);
        } catch (error) {
          console.error('Agora agent startup failed:', error);
          if (isMounted) {
            setAgentError(error instanceof Error ? error.message : 'Failed to start Agora agent.');
          }
        }

        if (dataClient.createDataStream) {
          try {
            streamIdRef.current = await dataClient.createDataStream({
              ordered: true,
              syncWithAudio: false,
            });
          } catch (streamErr) {
            console.warn('Agora data stream unavailable:', streamErr);
          }
        }

        setClient(agoraClient);
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        setIsConnected(true);
        setIsCameraReady(true);

        if (previewElementRef.current) {
          videoTrack.play(previewElementRef.current);
        }
      } catch (err) {
        console.error('Agora connection error:', err);
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to initialize Agora.';
          setConnectionError(message);
          setIsConnected(false);
          setIsCameraReady(false);
          setIsAgentSessionReady(false);
        }
      }
    };

    void initAgora();

    return () => {
      isMounted = false;
      remoteAudioTracksRef.current.forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore remote audio shutdown issues during cleanup.
        }
      });
      remoteAudioTracksRef.current.clear();
      createdAudioTrack?.close();
      createdVideoTrack?.close();
      void stopAgentSession();
      if (createdClient) {
        void createdClient.leave();
      }
    };
  }, [fetchRtcSession, shouldPlayAgentAudio, startAgentSession, stopAgentSession]);

  useEffect(() => {
    if (previewElementRef.current && localVideoTrack) {
      localVideoTrack.play(previewElementRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    remoteAudioTracksRef.current.forEach((track) => {
      try {
        if (shouldPlayAgentAudio) {
          track.play();
        } else {
          track.stop();
        }
      } catch (error) {
        console.warn('Failed to update remote agent audio playback:', error);
      }
    });
  }, [shouldPlayAgentAudio]);

  const sendContext = useCallback((text: string) => {
    setLastSentContext(text);

    const dataClient = client as DataStreamCapableClient | null;
    if (!dataClient || streamIdRef.current === null || !dataClient.sendStreamMessage) {
      return false;
    }

    try {
      void dataClient.sendStreamMessage(streamIdRef.current, new TextEncoder().encode(text));
      return true;
    } catch (err) {
      console.error('Failed to send Agora stream message:', err);
      return false;
    }
  }, [client]);

  const publishVideo = useCallback(async () => {
    if (!client || !isConnected || !localVideoTrack || isVideoPublished) {
      return false;
    }

    try {
      await client.publish([localVideoTrack]);
      setIsVideoPublished(true);
      return true;
    } catch (err) {
      console.error('Failed to publish video:', err);
      return false;
    }
  }, [client, isConnected, isVideoPublished, localVideoTrack]);

  const unpublishVideo = useCallback(async () => {
    if (!client || !localVideoTrack || !isVideoPublished) {
      return false;
    }

    try {
      await client.unpublish([localVideoTrack]);
      setIsVideoPublished(false);
      return true;
    } catch (err) {
      console.error('Failed to unpublish video:', err);
      return false;
    }
  }, [client, isVideoPublished, localVideoTrack]);

  return {
    client,
    isConnected,
    remoteUsers,
    connectionError,
    sendContext,
    publishVideo,
    unpublishVideo,
    attachPreview,
    isCameraReady,
    isVideoPublished,
    hasAgentAudio,
    isAgentSessionReady,
    agentError,
    lastSentContext,
    localAudioTrack,
    localVideoTrack,
  };
};
