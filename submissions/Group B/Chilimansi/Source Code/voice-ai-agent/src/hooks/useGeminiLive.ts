"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleGenAI, Modality, type Session } from "@google/genai";

const SYSTEM_INSTRUCTION =
  "You are First Aid Bot, an emergency medical voice assistant for the Philippines. You provide calm, clear first aid instructions to help responders assist patients in distress. Focus on the patient's condition and guide the responder step by step. Be concise and reassuring. Keep responses under 3 sentences. If the situation is life-threatening, always remind them to call 911 or 143 (Philippine Red Cross). Start by introducing yourself and asking what happened.";

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const sessionRef = useRef<Session | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) { console.error("NEXT_PUBLIC_GEMINI_API_KEY not set"); return; }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        },
        callbacks: {
          onopen: function () {
            console.log("Gemini Live: opened");
          },
          onmessage: function (message) {
            handleMessage(message);
          },
          onerror: function (e) {
            console.error("Gemini Live error:", e);
          },
          onclose: function (e) {
            console.log("Gemini Live: closed", e);
          },
        },
      });

      console.log("Session started");
      sessionRef.current = session;
      setIsConnected(true);

      // Start mic streaming
      await startMicStream(session);
    } catch (err) {
      console.error("Failed to connect:", err);
      setIsConnected(false);
    }
  }, []);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMessage = (message: any) => {
    console.log("Gemini raw message:", JSON.stringify(message).slice(0, 500));

    // The SDK parses messages for us - check different response formats
    if (message?.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.inlineData?.mimeType?.startsWith("audio/")) {
          const raw = atob(part.inlineData.data);
          const bytes = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
          playPcm(bytes, 24000);
        }
        if (part.text) {
          console.log("Gemini says:", part.text);
        }
      }
    }

    // Also check if the SDK wraps it differently
    if (message?.data) {
      console.log("Gemini data field:", typeof message.data === "string" ? message.data.slice(0, 200) : message.data);
    }
  };

  const playCtxRef = useRef<AudioContext | null>(null);
  const playTimeRef = useRef(0);

  const playPcm = (pcmBytes: Uint8Array, sampleRate: number) => {
    try {
      if (!playCtxRef.current || playCtxRef.current.state === "closed") {
        playCtxRef.current = new AudioContext({ sampleRate });
        playTimeRef.current = playCtxRef.current.currentTime;
      }
      const ctx = playCtxRef.current;
      const samples = new Int16Array(pcmBytes.buffer);
      const float32 = new Float32Array(samples.length);
      for (let i = 0; i < samples.length; i++) float32[i] = samples[i] / 32768;
      const buf = ctx.createBuffer(1, float32.length, sampleRate);
      buf.copyToChannel(float32, 0);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, playTimeRef.current);
      src.start(startTime);
      playTimeRef.current = startTime + buf.duration;
    } catch (err) {
      console.error("Playback error:", err);
    }
  };

  const startMicStream = async (session: Session) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const mediaSource = ctx.createMediaStreamSource(stream);

    // Use AudioWorklet-compatible approach via MediaRecorder
    // But for simplicity, use ScriptProcessor (deprecated but works)
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const inputRate = ctx.sampleRate;
    const targetRate = 16000;

    processor.onaudioprocess = (e) => {
      if (!sessionRef.current) { processor.disconnect(); return; }

      const input = e.inputBuffer.getChannelData(0);
      const ratio = inputRate / targetRate;
      const len = Math.floor(input.length / ratio);
      const pcm16 = new Int16Array(len);
      for (let i = 0; i < len; i++) {
        const s = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      const bytes = new Uint8Array(pcm16.buffer as ArrayBuffer);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);

      try {
        session.sendRealtimeInput({ media: { mimeType: "audio/pcm;rate=16000", data: btoa(bin) } });
      } catch {
        processor.disconnect();
      }
    };

    mediaSource.connect(processor);
    processor.connect(ctx.destination);
  };

  const disconnect = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    playCtxRef.current?.close().catch(() => {});
    sessionRef.current?.close();
    sessionRef.current = null;
    audioCtxRef.current = null;
    playCtxRef.current = null;
    playTimeRef.current = 0;
    setIsConnected(false);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
      return next;
    });
  }, []);

  return { isConnected, isMuted, connect, disconnect, toggleMute };
}
