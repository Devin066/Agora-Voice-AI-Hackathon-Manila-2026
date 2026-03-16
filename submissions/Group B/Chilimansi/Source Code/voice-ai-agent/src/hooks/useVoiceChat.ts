"use client";

import { useState, useCallback, useRef } from "react";

type Message = { role: string; content: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useVoiceChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const historyRef = useRef<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((base64: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      audioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); resolve(); };
      audio.onerror = () => { setIsSpeaking(false); resolve(); };
      audio.play().catch(() => { setIsSpeaking(false); resolve(); });
    });
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    historyRef.current.push({ role: "user", content: text });
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: historyRef.current.slice(-10) }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.reply) historyRef.current.push({ role: "assistant", content: data.reply });
    if (data.audio) await playAudio(data.audio);
  }, [playAudio]);

  const startListening = useCallback(() => {
    if (isMuted || !isConnected) return;
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        await sendMessage(transcript);
        if (!isMuted) startListening();
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [isMuted, isConnected, sendMessage]);

  const connect = useCallback(async () => {
    setIsConnected(true);
    historyRef.current = [];
    await sendMessage("Hello, I need help with a medical emergency.");
    startListening();
  }, [sendMessage, startListening]);

  const disconnect = useCallback(() => {
    recognitionRef.current?.stop();
    audioRef.current?.pause();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    historyRef.current = [];
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) recognitionRef.current?.stop();
      else if (isConnected) startListening();
      return next;
    });
  }, [isConnected, startListening]);

  return { isConnected, isListening, isSpeaking, isMuted, connect, disconnect, toggleMute };
}
