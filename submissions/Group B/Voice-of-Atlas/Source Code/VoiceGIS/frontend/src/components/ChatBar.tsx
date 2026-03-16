'use client';

import { useState, useRef, useEffect } from 'react';
import ToggleSwitch from '@/components/ToggleSwitch';
import { Send, Mic, MicOff, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';

type Message = { role: 'user' | 'assistant'; content: string };

// Optional "by N" / "N%" / "N percent" after zoom in/out. Supports both "30%" and "30 percent" (voice).
const ZOOM_PCT = '(?:by\\s+)?(\\d+)\\s*(?:%|percent|per\\s*cent)?';

/** Parse zoom-in/zoom-out intent from user message. Returns delta in zoom levels (positive = in, negative = out). */
function parseZoomCommand(text: string): number | null {
  const lower = text.toLowerCase().trim();
  const zoomInRe = new RegExp(`\\bzoom\\s+in\\b(?:.*?${ZOOM_PCT})?`, 'i');
  const zoomOutRe = new RegExp(`\\bzoom\\s+out\\b(?:.*?${ZOOM_PCT})?`, 'i');
  const zoomInMatch = lower.match(zoomInRe);
  const zoomOutMatch = lower.match(zoomOutRe);
  if (zoomInMatch) {
    const pct = parseInt(zoomInMatch[1] || '20', 10);
    // 20% -> 1 level, 30% -> 2, 50% -> 3, 100% -> 5 so different % = clearly different zoom
    const delta = Math.max(1, Math.round(pct / 20));
    return delta;
  }
  if (zoomOutMatch) {
    const pct = parseInt(zoomOutMatch[1] || '20', 10);
    const delta = Math.max(1, Math.round(pct / 20));
    return -delta;
  }
  return null;
}

/** Parse location search intent. Returns the place name to search for, or null. */
function parseLocationCommand(text: string): string | null {
  const t = text.trim();
  if (!t.length) return null;
  const lower = t.toLowerCase();
  // "Show Quezon City in the map", "Pin Pasig city on the map", "show me Manila in the map"
  const showPin = /\b(?:show\s+(?:me\s+)?|pin\s+)(.+?)\s+(?:in|on)\s+the\s+map\b/i.exec(t);
  if (showPin?.[1]) return showPin[1].trim();
  // "Search for X", "find X", "go to X", "navigate to X", "locate X", "where is X"
  const searchFind = /\b(?:search\s+for|find|go\s+to|navigate\s+to|locate|where\s+is)\s+(.+?)$/i.exec(t);
  if (searchFind?.[1]) return searchFind[1].trim();
  return null;
}

/** Map natural-language amenity phrases to API amenity keys (OSM-based). */
const AMENITY_PHRASE_TO_KEY: Record<string, string> = {
  'health facilities': 'health_facilities',
  'health facility': 'health',
  hospitals: 'hospitals',
  hospital: 'hospitals',
  clinics: 'clinics',
  clinic: 'clinics',
  pharmacies: 'pharmacies',
  pharmacy: 'pharmacies',
  'police stations': 'police',
  police: 'police',
  schools: 'schools',
  school: 'schools',
  restaurants: 'restaurants',
  restaurant: 'restaurants',
  banks: 'banks',
  bank: 'banks',
  atms: 'atms',
  atm: 'atms',
  'fuel stations': 'fuel',
  'gas stations': 'fuel',
  fuel: 'fuel',
  parking: 'parking',
};

/** Normalize place query for geocoding: strip leading "the ", trim. */
function normalizePlaceQuery(place: string): string {
  return place.trim().replace(/^\s*the\s+/i, '').trim() || place.trim();
}

/** Parse "show X in Y" / "find X in Y" / "can you show X in Y" for amenities. Returns { amenityKey, placeQuery } or null. */
function parseAmenityCommand(text: string): { amenityKey: string; placeQuery: string } | null {
  const t = text.trim();
  if (!t.length) return null;
  // "Show health facilities in the Philippines", "can you show health facilities in the philippines", "show me police stations in Manila", "find hospitals in Quezon City"
  const showIn = /\b(?:can you\s+|could you\s+|please\s+)?(?:show\s+(?:me\s+)?|find|mark|pin|locate|where\s+are)\s+(.+?)\s+in\s+(.+?)$/i.exec(t);
  if (!showIn?.[1] || !showIn?.[2]) return null;
  const phrase = showIn[1].trim().toLowerCase();
  const placeRaw = showIn[2].trim();
  const placeQuery = normalizePlaceQuery(placeRaw);
  if (!placeQuery) return null;
  const key = AMENITY_PHRASE_TO_KEY[phrase] ?? phrase.replace(/\s+/g, '_');
  return { amenityKey: key, placeQuery };
}

/**
 * In voice mode, only process if user said "Hey Atlas" (or "Atlas", "Okay Atlas").
 * Looks for the wake word anywhere in the transcript (not just at the start) so that
 * noisy audio like "something something hey atlas zoom in" still works.
 * Returns the command after the last occurrence of the wake word, or null if none found.
 */
function getVoiceCommandAfterWakeWord(transcript: string): string | null {
  const t = transcript.trim().replace(/\s+/g, ' ');
  if (!t.length) return null;
  // Match wake word at start (original behavior)
  const atStart = /^(?:hey\s+|ok(?:ay)?\s+)?atlas\b[\s,]*(.*)$/i.exec(t);
  if (atStart) return atStart[1].trim();
  // Otherwise look for "hey atlas", "okay atlas", or "atlas" anywhere; use last occurrence so we get the intended command after noise
  const wakePattern = /\b(?:hey\s+|ok(?:ay)?\s+)?atlas\b/i;
  let lastIndex = -1;
  let match: RegExpExecArray | null;
  const re = new RegExp(wakePattern.source, 'gi');
  while ((match = re.exec(t)) !== null) lastIndex = match.index;
  if (lastIndex === -1) return null;
  const afterWake = t.slice(lastIndex).replace(/^(?:hey\s+|ok(?:ay)?\s+)?atlas\b[\s,]*/i, '').trim();
  return afterWake;
}

/** True if the text is a reset map request (chat or voice command after wake word). */
function parseResetCommand(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t.length) return false;
  return (
    /\breset\s+(?:the\s+)?map\b/.test(t) ||
    /\bclear\s+(?:the\s+)?map\b/.test(t) ||
    /\bgo\s+back\s+to\s+(?:the\s+)?(?:default|start)\b/.test(t) ||
    /\b(?:can you |please )?reset\s+(?:the\s+)?map\b/.test(t)
  );
}

/** True if the text is a request to show traffic incidents in the current map view. */
function parseTrafficIncidentsCommand(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t.length) return false;
  return (
    /\btraffic\s+incidents\b/.test(t) ||
    /\bshow\s+(?:me\s+)?(?:traffic\s+)?incidents\b/.test(t) ||
    /\bshow\s+(?:me\s+)?traffic\b/.test(t) ||
    /\b(?:where\s+are\s+)?(?:the\s+)?traffic\s+incidents\b/.test(t) ||
    /\b(?:show\s+)?accidents\s+(?:in\s+)?(?:the\s+)?(?:area|view|map)\b/.test(t)
  );
}

type ChatBarProps = {
  /** true = voice mode, false = chat mode */
  voiceMode: boolean;
  onVoiceModeChange: (value: boolean) => void;
  /** Leaflet map instance for executing zoom commands */
  map: LeafletMap | null;
  /** When user asks to show/pin/search a place, call with the place query (runs Geoapify search and flies map). */
  onLocationSearch?: (query: string) => void | Promise<void>;
  /** When user asks to show amenities in a place (e.g. "show health facilities in the Philippines"), call with amenity key and place. */
  onShowAmenities?: (amenityKey: string, placeQuery: string) => void | Promise<void>;
  /** When user asks to show traffic incidents in the current map view (uses map bounds). */
  onShowTrafficIncidents?: () => void | Promise<void>;
  /** When user asks to reset the map (e.g. "reset the map"), call to clear view/marker/search. */
  onReset?: () => void;
};

export default function ChatBar({ voiceMode, onVoiceModeChange, map, onLocationSearch, onShowAmenities, onShowTrafficIncidents, onReset }: ChatBarProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  /** True when waiting for Atlas to respond (Agora: after you spoke; browser: while /api/chat is in flight). */
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  /** True when Atlas is playing a reply (browser TTS or Agora agent audio). */
  const [atlasSpeaking, setAtlasSpeaking] = useState(false);
  const [messagesAreaVisible, setMessagesAreaVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const voiceRequestInFlightRef = useRef(false);
  const rtcClientRef = useRef<unknown>(null);
  const localAudioRef = useRef<{ close: () => void } | null>(null);
  const channelRef = useRef<string | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentProcessingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentSpeakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Fire zoom/location from interim after this ms of stable transcript (so we don't wait for slow "final"). */
  const interimCommandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedTranscriptRef = useRef<string | null>(null);
  const INTERIM_COMMAND_DELAY_MS = 380;
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /** Prefer a more natural-sounding system voice when available (e.g. Samantha, Google US English). */
  const getPreferredTtsVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const en = voices.filter((v) => v.lang.startsWith('en'));
    const preferred =
      en.find((v) => /samantha|karen|daniel|aria|google|natural|premium/i.test(v.name)) ||
      en.find((v) => v.lang === 'en-US') ||
      en[0];
    return preferred ?? null;
  };
  const setUtteranceVoice = (u: SpeechSynthesisUtterance) => {
    const v = getPreferredTtsVoice();
    if (v) u.voice = v;
  };

  const GREETING = "I'm Atlas, your map assistant. You can ask me to zoom the map or search for places. What would you like to do?";
  const speakGreeting = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(GREETING);
    u.lang = 'en-US';
    u.rate = 0.95;
    setUtteranceVoice(u);
    window.speechSynthesis.speak(u);
  };

  const speakDontUnderstand = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("I don't understand your request. Say 'Hey Atlas' then your command.");
    u.lang = 'en-US';
    u.rate = 0.95;
    setUtteranceVoice(u);
    window.speechSynthesis.speak(u);
  };

  const sendChat = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    setVoiceError(null);

    const zoomDelta = parseZoomCommand(text);
    if (map && zoomDelta !== null) {
      const nextZoom = map.getZoom() + zoomDelta;
      map.setZoom(Math.max(0, Math.min(20, nextZoom)));
    }

    if (parseResetCommand(text) && onReset) {
      onReset();
      setMessages((m) => [...m, { role: 'assistant', content: 'Map reset.' }]);
      setLoading(false);
      return;
    }

    const amenityCmd = parseAmenityCommand(text);
    if (amenityCmd && onShowAmenities) {
      try {
        await Promise.resolve(onShowAmenities(amenityCmd.amenityKey, amenityCmd.placeQuery));
        setMessages((m) => [...m, { role: 'assistant', content: `Showing ${amenityCmd.amenityKey.replace(/_/g, ' ')} in ${amenityCmd.placeQuery} on the map.` }]);
      } catch (e) {
        setMessages((m) =>
          m.concat({
            role: 'assistant',
            content: e instanceof Error ? e.message : 'Could not load amenities for that area.',
          })
        );
      }
      setLoading(false);
      return;
    }

    if (parseTrafficIncidentsCommand(text) && onShowTrafficIncidents) {
      try {
        await Promise.resolve(onShowTrafficIncidents());
        setMessages((m) => [...m, { role: 'assistant', content: 'Showing traffic incidents in the current map view.' }]);
      } catch (e) {
        setMessages((m) =>
          m.concat({
            role: 'assistant',
            content: e instanceof Error ? e.message : 'Could not load traffic incidents. Zoom in and try again.',
          })
        );
      }
      setLoading(false);
      return;
    }

    const locationQuery = parseLocationCommand(text);
    if (locationQuery && onLocationSearch) {
      try {
        await Promise.resolve(onLocationSearch(locationQuery));
        setMessages((m) => [...m, { role: 'assistant', content: `Showing ${locationQuery} on the map.` }]);
      } catch (e) {
        setMessages((m) =>
          m.concat({
            role: 'assistant',
            content: `Could not find "${locationQuery}". Try a different place name.`,
          })
        );
      }
      setLoading(false);
      return;
    }

    try {
      const history = [...messages, { role: 'user' as const, content: text }];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setMessages((m) => [...m, { role: 'assistant', content: data.content || '' }]);
    } catch (e) {
      setMessages((m) =>
        m.concat({
          role: 'assistant',
          content: `Error: ${e instanceof Error ? e.message : 'Failed to get response'}`,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const startVoiceZoomListener = () => {
    if (typeof window === 'undefined' || !map) return;
    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = (Array.from(result) as SpeechRecognitionAlternative[]).map((r) => r.transcript).join(' ').trim();
        setVoiceTranscript(transcript ? (result.isFinal ? transcript : transcript + '…') : '');
        const command = transcript ? getVoiceCommandAfterWakeWord(transcript) : null;
        const hasZoom = command !== null && command !== '' && map && parseZoomCommand(command) !== null;
        const hasLocation = command !== null && command !== '' && parseLocationCommand(command) !== null && onLocationSearch;
        const hasAmenities = command !== null && command !== '' && parseAmenityCommand(command) !== null && onShowAmenities;
        const hasTrafficIncidents = command !== null && command !== '' && parseTrafficIncidentsCommand(command) && onShowTrafficIncidents;
        const hasReset = command !== null && command !== '' && parseResetCommand(command) && onReset;
        const canTriggerFromInterim = hasZoom || hasLocation || hasAmenities || hasTrafficIncidents || hasReset;
        if (!result.isFinal) {
          if (canTriggerFromInterim && command) {
            if (interimCommandTimerRef.current) clearTimeout(interimCommandTimerRef.current);
            interimCommandTimerRef.current = setTimeout(() => {
              interimCommandTimerRef.current = null;
              lastProcessedTranscriptRef.current = transcript;
              if (parseResetCommand(command!) && onReset) {
                onReset();
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance('Map reset.');
                  u.lang = 'en-US';
                  u.rate = 0.95;
                  setUtteranceVoice(u);
                  window.speechSynthesis.speak(u);
                }
                if (agentProcessingTimerRef.current) {
                  clearTimeout(agentProcessingTimerRef.current);
                  agentProcessingTimerRef.current = null;
                }
                setVoiceProcessing(true);
                agentProcessingTimerRef.current = setTimeout(() => {
                  agentProcessingTimerRef.current = null;
                  setVoiceProcessing(false);
                  lastProcessedTranscriptRef.current = null;
                }, 18000);
              } else {
              const zoomDelta = parseZoomCommand(command!);
              if (map && zoomDelta !== null) {
                const nextZoom = map.getZoom() + zoomDelta;
                map.setZoom(Math.max(0, Math.min(20, nextZoom)));
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
const u = new SpeechSynthesisUtterance(zoomDelta > 0 ? 'Zoomed in.' : 'Zoomed out.');
                u.lang = 'en-US';
                u.rate = 0.95;
                setUtteranceVoice(u);
                window.speechSynthesis.speak(u);
                }
              }
              const locationQuery = parseLocationCommand(command!);
              if (locationQuery && onLocationSearch) {
                Promise.resolve(onLocationSearch(locationQuery)).then(() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(`Showing ${locationQuery} on the map.`);
                    u.lang = 'en-US';
                    u.rate = 0.95;
                    setUtteranceVoice(u);
                    window.speechSynthesis.speak(u);
                  }
                }).catch(() => {});
              }
              const amenityCmd = parseAmenityCommand(command!);
              if (amenityCmd && onShowAmenities) {
                Promise.resolve(onShowAmenities(amenityCmd.amenityKey, amenityCmd.placeQuery)).then(() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(`Showing ${amenityCmd.amenityKey.replace(/_/g, ' ')} in ${amenityCmd.placeQuery} on the map.`);
                    u.lang = 'en-US';
                    u.rate = 0.95;
                    setUtteranceVoice(u);
                    window.speechSynthesis.speak(u);
                  }
                }).catch(() => {});
              }
              if (parseTrafficIncidentsCommand(command!) && onShowTrafficIncidents) {
                Promise.resolve(onShowTrafficIncidents()).then(() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Showing traffic incidents in the current map view.');
                    u.lang = 'en-US';
                    u.rate = 0.95;
                    setUtteranceVoice(u);
                    window.speechSynthesis.speak(u);
                  }
                }).catch(() => {});
              }
              if (agentProcessingTimerRef.current) {
                clearTimeout(agentProcessingTimerRef.current);
                agentProcessingTimerRef.current = null;
              }
              setVoiceProcessing(true);
              agentProcessingTimerRef.current = setTimeout(() => {
                agentProcessingTimerRef.current = null;
                setVoiceProcessing(false);
                lastProcessedTranscriptRef.current = null;
              }, 18000);
              }
            }, INTERIM_COMMAND_DELAY_MS);
          }
          continue;
        }
        if (!transcript) continue;
        if (interimCommandTimerRef.current) {
          clearTimeout(interimCommandTimerRef.current);
          interimCommandTimerRef.current = null;
        }
        const alreadyProcessed = lastProcessedTranscriptRef.current && (
          transcript.startsWith(lastProcessedTranscriptRef.current.trim()) ||
          lastProcessedTranscriptRef.current.trim().startsWith(transcript)
        );
        if (alreadyProcessed) {
          lastProcessedTranscriptRef.current = null;
          continue;
        }
        if (command === null) {
          speakDontUnderstand();
          return;
        }
        if (!command) return;
        if (parseResetCommand(command) && onReset) {
          lastProcessedTranscriptRef.current = transcript;
          onReset();
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance('Map reset.');
            u.lang = 'en-US';
            u.rate = 0.95;
            setUtteranceVoice(u);
            window.speechSynthesis.speak(u);
          }
          if (agentProcessingTimerRef.current) {
            clearTimeout(agentProcessingTimerRef.current);
            agentProcessingTimerRef.current = null;
          }
          setVoiceProcessing(true);
          agentProcessingTimerRef.current = setTimeout(() => {
            agentProcessingTimerRef.current = null;
            setVoiceProcessing(false);
            lastProcessedTranscriptRef.current = null;
          }, 18000);
          continue;
        }
        const amenityCmdFinal = parseAmenityCommand(command);
        if (amenityCmdFinal && onShowAmenities) {
          lastProcessedTranscriptRef.current = transcript;
          Promise.resolve(onShowAmenities(amenityCmdFinal.amenityKey, amenityCmdFinal.placeQuery)).then(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(`Showing ${amenityCmdFinal.amenityKey.replace(/_/g, ' ')} in ${amenityCmdFinal.placeQuery} on the map.`);
              u.lang = 'en-US';
              u.rate = 0.95;
              setUtteranceVoice(u);
              window.speechSynthesis.speak(u);
            }
          }).catch(() => {});
        }
        if (parseTrafficIncidentsCommand(command) && onShowTrafficIncidents) {
          lastProcessedTranscriptRef.current = transcript;
          Promise.resolve(onShowTrafficIncidents()).then(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance('Showing traffic incidents in the current map view.');
              u.lang = 'en-US';
              u.rate = 0.95;
              setUtteranceVoice(u);
              window.speechSynthesis.speak(u);
            }
          }).catch(() => {});
        }
        const zoomDelta = parseZoomCommand(command);
        if (map && zoomDelta !== null) {
          lastProcessedTranscriptRef.current = transcript;
          const nextZoom = map.getZoom() + zoomDelta;
          map.setZoom(Math.max(0, Math.min(20, nextZoom)));
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
const u = new SpeechSynthesisUtterance(zoomDelta > 0 ? 'Zoomed in.' : 'Zoomed out.');
                u.lang = 'en-US';
                u.rate = 0.95;
                setUtteranceVoice(u);
                window.speechSynthesis.speak(u);
          }
        }
        const locationQuery = parseLocationCommand(command);
        if (locationQuery && onLocationSearch) {
          lastProcessedTranscriptRef.current = transcript;
          Promise.resolve(onLocationSearch(locationQuery)).then(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(`Showing ${locationQuery} on the map.`);
              u.lang = 'en-US';
              u.rate = 0.95;
              setUtteranceVoice(u);
              window.speechSynthesis.speak(u);
            }
          }).catch(() => {});
        }
        if (agentProcessingTimerRef.current) {
          clearTimeout(agentProcessingTimerRef.current);
          agentProcessingTimerRef.current = null;
        }
        setVoiceProcessing(true);
        agentProcessingTimerRef.current = setTimeout(() => {
          agentProcessingTimerRef.current = null;
          setVoiceProcessing(false);
          lastProcessedTranscriptRef.current = null;
        }, 18000);
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg =
        event.error === 'not-allowed'
          ? 'Microphone access denied. Allow mic for this site and try again.'
          : event.error === 'no-speech'
            ? 'No speech heard. Speak clearly and check your mic.'
            : event.error === 'audio-capture'
              ? 'Microphone in use elsewhere? Close other tabs and try again.'
              : event.error === 'network'
                ? 'Listening uses the browser’s online speech-to-text (not your LLM). Disable ad blocker for this site, try Incognito, or use Chrome — then try again.'
                : `Recognition error: ${event.error}`;
      setVoiceError(msg);
    };
    recognition.onend = () => {
      if (speechRecognitionRef.current !== recognition) return;
      setTimeout(() => {
        if (speechRecognitionRef.current !== recognition) return;
        try {
          recognition.start();
        } catch {
          /* already started or aborted */
        }
      }, 100);
    };
    recognition.start();
    speechRecognitionRef.current = recognition;
  };

  const startBrowserVoiceListener = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = (Array.from(result) as SpeechRecognitionAlternative[]).map((r) => r.transcript).join(' ').trim();
        setVoiceTranscript(transcript ? (result.isFinal ? transcript : transcript + '…') : '');
        const command = transcript ? getVoiceCommandAfterWakeWord(transcript) : null;
        const hasZoom = command !== null && command !== '' && map && parseZoomCommand(command) !== null;
        const hasLocation = command !== null && command !== '' && parseLocationCommand(command) !== null && onLocationSearch;
        const hasAmenities = command !== null && command !== '' && parseAmenityCommand(command) !== null && onShowAmenities;
        const hasTrafficIncidents = command !== null && command !== '' && parseTrafficIncidentsCommand(command) && onShowTrafficIncidents;
        const hasReset = command !== null && command !== '' && parseResetCommand(command) && onReset;
        const canTriggerFromInterim = hasZoom || hasLocation || hasAmenities || hasTrafficIncidents || hasReset;
        if (!result.isFinal) {
          if (canTriggerFromInterim && command && !voiceRequestInFlightRef.current) {
            if (interimCommandTimerRef.current) clearTimeout(interimCommandTimerRef.current);
            interimCommandTimerRef.current = setTimeout(() => {
              interimCommandTimerRef.current = null;
              voiceRequestInFlightRef.current = true;
              lastProcessedTranscriptRef.current = transcript;
              if (parseResetCommand(command!) && onReset) {
                onReset();
                setMessages((prev) => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: 'Map reset.' }]);
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance('Map reset.');
                  u.lang = 'en-US';
                  u.rate = 0.95;
                  setUtteranceVoice(u);
                  u.onend = () => { setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                  u.onerror = () => { setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                  window.speechSynthesis.speak(u);
                } else {
                  voiceRequestInFlightRef.current = false;
                }
              } else {
              const zoomDelta = parseZoomCommand(command!);
              if (map && zoomDelta !== null) {
                const nextZoom = map.getZoom() + zoomDelta;
                map.setZoom(Math.max(0, Math.min(20, nextZoom)));
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
const u = new SpeechSynthesisUtterance(zoomDelta > 0 ? 'Zoomed in.' : 'Zoomed out.');
                u.lang = 'en-US';
                u.rate = 0.95;
                setUtteranceVoice(u);
                window.speechSynthesis.speak(u);
                }
                voiceRequestInFlightRef.current = false;
              }
              const locationQuery = parseLocationCommand(command!);
              if (locationQuery && onLocationSearch) {
                setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
                setVoiceProcessing(true);
                setVoiceError(null);
                Promise.resolve(onLocationSearch(locationQuery))
                  .then(() => {
                    const msg = `Showing ${locationQuery} on the map.`;
                    setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(msg);
                      u.lang = 'en-US';
                      u.rate = 1;
                      setUtteranceVoice(u);
                      u.onend = () => { setAtlasSpeaking(false); setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                      u.onerror = () => { setAtlasSpeaking(false); setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                      setAtlasSpeaking(true);
                      window.speechSynthesis.speak(u);
                    } else {
                      setVoiceProcessing(false);
                      voiceRequestInFlightRef.current = false;
                    }
                  })
                  .catch(() => {
                    setVoiceError('Could not find that place.');
                    setVoiceProcessing(false);
                    voiceRequestInFlightRef.current = false;
                  });
              }
              const amenityCmdInterim = parseAmenityCommand(command!);
              if (amenityCmdInterim && onShowAmenities) {
                setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
                setVoiceProcessing(true);
                setVoiceError(null);
                Promise.resolve(onShowAmenities(amenityCmdInterim.amenityKey, amenityCmdInterim.placeQuery))
                  .then(() => {
                    const msg = `Showing ${amenityCmdInterim.amenityKey.replace(/_/g, ' ')} in ${amenityCmdInterim.placeQuery} on the map.`;
                    setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(msg);
                      u.lang = 'en-US';
                      u.rate = 1;
                      setUtteranceVoice(u);
                      u.onend = () => { setAtlasSpeaking(false); setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                      u.onerror = () => { setAtlasSpeaking(false); setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                      setAtlasSpeaking(true);
                      window.speechSynthesis.speak(u);
                    } else {
                      setVoiceProcessing(false);
                      voiceRequestInFlightRef.current = false;
                    }
                  })
                  .catch(() => {
                    setVoiceError('Could not load amenities for that area.');
                    setVoiceProcessing(false);
                    voiceRequestInFlightRef.current = false;
                  });
              }
              if (parseTrafficIncidentsCommand(command!) && onShowTrafficIncidents) {
                setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
                setVoiceProcessing(true);
                setVoiceError(null);
                Promise.resolve(onShowTrafficIncidents())
                  .then(() => {
                    const msg = 'Showing traffic incidents in the current map view.';
                    setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(msg);
                      u.lang = 'en-US';
                      u.rate = 1;
                      setUtteranceVoice(u);
                      u.onend = () => { setAtlasSpeaking(false); setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                      u.onerror = () => { setAtlasSpeaking(false); setVoiceProcessing(false); voiceRequestInFlightRef.current = false; };
                      setAtlasSpeaking(true);
                      window.speechSynthesis.speak(u);
                    } else {
                      setVoiceProcessing(false);
                      voiceRequestInFlightRef.current = false;
                    }
                  })
                  .catch(() => {
                    setVoiceError('Could not load traffic incidents. Zoom in and try again.');
                    setVoiceProcessing(false);
                    voiceRequestInFlightRef.current = false;
                  });
              }
              }
            }, INTERIM_COMMAND_DELAY_MS);
          }
          continue;
        }
        if (!transcript) continue;
        if (interimCommandTimerRef.current) {
          clearTimeout(interimCommandTimerRef.current);
          interimCommandTimerRef.current = null;
        }
        const alreadyProcessed = lastProcessedTranscriptRef.current && (
          transcript.startsWith(lastProcessedTranscriptRef.current.trim()) ||
          lastProcessedTranscriptRef.current.trim().startsWith(transcript)
        );
        if (alreadyProcessed) {
          lastProcessedTranscriptRef.current = null;
          continue;
        }
        if (command === null) {
          speakDontUnderstand();
          return;
        }
        if (!command) return;

        if (parseResetCommand(command) && onReset) {
          onReset();
          setMessages((prev) => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: 'Map reset.' }]);
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
const u = new SpeechSynthesisUtterance('Map reset.');
            u.lang = 'en-US';
            u.rate = 0.95;
            setUtteranceVoice(u);
            window.speechSynthesis.speak(u);
          }
          return;
        }

        const amenityCmdBrowser = parseAmenityCommand(command);
        if (amenityCmdBrowser && onShowAmenities) {
          if (voiceRequestInFlightRef.current) return;
          voiceRequestInFlightRef.current = true;
          setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
          setVoiceProcessing(true);
          setVoiceError(null);
          Promise.resolve(onShowAmenities(amenityCmdBrowser.amenityKey, amenityCmdBrowser.placeQuery))
            .then(() => {
              const msg = `Showing ${amenityCmdBrowser.amenityKey.replace(/_/g, ' ')} in ${amenityCmdBrowser.placeQuery} on the map.`;
              setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(msg);
                u.lang = 'en-US';
                u.rate = 1;
                setUtteranceVoice(u);
                u.onend = () => {
                  setAtlasSpeaking(false);
                  setVoiceProcessing(false);
                  voiceRequestInFlightRef.current = false;
                };
                u.onerror = () => {
                  setAtlasSpeaking(false);
                  setVoiceProcessing(false);
                  voiceRequestInFlightRef.current = false;
                };
                setAtlasSpeaking(true);
                window.speechSynthesis.speak(u);
              } else {
                setVoiceProcessing(false);
                voiceRequestInFlightRef.current = false;
              }
            })
            .catch(() => {
              setVoiceError('Could not load amenities for that area.');
              setVoiceProcessing(false);
              voiceRequestInFlightRef.current = false;
            });
          return;
        }

        if (parseTrafficIncidentsCommand(command) && onShowTrafficIncidents) {
          if (voiceRequestInFlightRef.current) return;
          voiceRequestInFlightRef.current = true;
          setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
          setVoiceProcessing(true);
          setVoiceError(null);
          Promise.resolve(onShowTrafficIncidents())
            .then(() => {
              const msg = 'Showing traffic incidents in the current map view.';
              setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(msg);
                u.lang = 'en-US';
                u.rate = 1;
                setUtteranceVoice(u);
                u.onend = () => {
                  setAtlasSpeaking(false);
                  setVoiceProcessing(false);
                  voiceRequestInFlightRef.current = false;
                };
                u.onerror = () => {
                  setAtlasSpeaking(false);
                  setVoiceProcessing(false);
                  voiceRequestInFlightRef.current = false;
                };
                setAtlasSpeaking(true);
                window.speechSynthesis.speak(u);
              } else {
                setVoiceProcessing(false);
                voiceRequestInFlightRef.current = false;
              }
            })
            .catch(() => {
              setVoiceError('Could not load traffic incidents. Zoom in and try again.');
              setVoiceProcessing(false);
              voiceRequestInFlightRef.current = false;
            });
          return;
        }

        const zoomDelta = parseZoomCommand(command);
        if (map && zoomDelta !== null) {
          const nextZoom = map.getZoom() + zoomDelta;
          map.setZoom(Math.max(0, Math.min(20, nextZoom)));
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(zoomDelta > 0 ? 'Zoomed in.' : 'Zoomed out.');
                u.lang = 'en-US';
                u.rate = 0.95;
                setUtteranceVoice(u);
                window.speechSynthesis.speak(u);
          }
          return;
        }

        const locationQuery = parseLocationCommand(command);
        if (locationQuery && onLocationSearch) {
          if (voiceRequestInFlightRef.current) return;
          voiceRequestInFlightRef.current = true;
          setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
          setVoiceProcessing(true);
          setVoiceError(null);
          Promise.resolve(onLocationSearch(locationQuery))
            .then(() => {
              const msg = `Showing ${locationQuery} on the map.`;
              setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(msg);
                u.lang = 'en-US';
                u.rate = 1;
                setUtteranceVoice(u);
                u.onend = () => {
                  setAtlasSpeaking(false);
                  setVoiceProcessing(false);
                  voiceRequestInFlightRef.current = false;
                };
                u.onerror = () => {
                  setAtlasSpeaking(false);
                  setVoiceProcessing(false);
                  voiceRequestInFlightRef.current = false;
                };
                setAtlasSpeaking(true);
                window.speechSynthesis.speak(u);
              } else {
                setVoiceProcessing(false);
                voiceRequestInFlightRef.current = false;
              }
            })
            .catch(() => {
              setVoiceError('Could not find that place.');
              setVoiceProcessing(false);
              voiceRequestInFlightRef.current = false;
            });
          return;
        }

        if (voiceRequestInFlightRef.current) return;
        voiceRequestInFlightRef.current = true;
        setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
        setVoiceProcessing(true);
        setLoading(true);
        setVoiceError(null);
        const history = [...messagesRef.current, { role: 'user' as const, content: transcript }];
        const historyForApi = history.length ? [...history.slice(0, -1), { role: 'user' as const, content: command }] : [{ role: 'user' as const, content: command }];
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyForApi.map(({ role, content }) => ({ role, content })) }),
        })
          .then((res) => res.json())
          .then((data) => {
            const content = data.content != null ? String(data.content).trim() : '';
            if (content) setMessages((prev) => [...prev, { role: 'assistant', content }]);
            const toSpeak = content || "I didn't get a response. Try again.";
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(toSpeak);
              u.lang = 'en-US';
              u.rate = 1;
              setUtteranceVoice(u);
              u.onend = () => setAtlasSpeaking(false);
              u.onerror = () => setAtlasSpeaking(false);
              setAtlasSpeaking(true);
              window.speechSynthesis.speak(u);
            }
          })
          .catch((e) => {
            const msg = e instanceof Error ? e.message : 'Voice request failed';
            setVoiceError(msg);
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance("Sorry, something went wrong. Try again.");
              u.lang = 'en-US';
              u.rate = 0.95;
              setUtteranceVoice(u);
              window.speechSynthesis.speak(u);
            }
          })
          .finally(() => {
            setLoading(false);
            setVoiceProcessing(false);
            voiceRequestInFlightRef.current = false;
          });
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg =
        event.error === 'not-allowed'
          ? 'Microphone access denied. Allow mic for this site and try again.'
          : event.error === 'no-speech'
            ? 'No speech heard. Speak clearly and check your mic.'
            : event.error === 'audio-capture'
              ? 'Microphone in use elsewhere? Close other tabs and try again.'
              : event.error === 'network'
                ? 'Listening uses the browser’s online speech-to-text (not your LLM). Disable ad blocker for this site, try Incognito, or use Chrome — then try again.'
                : `Recognition error: ${event.error}`;
      setVoiceError(msg);
    };
    recognition.onend = () => {
      if (speechRecognitionRef.current !== recognition) return;
      setTimeout(() => {
        if (speechRecognitionRef.current !== recognition) return;
        try {
          recognition.start();
        } catch {
          /* already started or aborted */
        }
      }, 100);
    };
    recognition.start();
    speechRecognitionRef.current = recognition;
  };

  const startVoice = async () => {
    if (voiceActive) return;
    setVoiceError(null);
    setVoiceTranscript('');

    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        setVoiceError('Microphone access denied. Allow mic for this site (address bar) and try again.');
        return;
      }
    }

    const channelName = `atlas-${Date.now()}`;
    const userUid = 1;
    try {
      const [tokenRes, joinRes] = await Promise.all([
        fetch(`/api/agora/token?channel=${encodeURIComponent(channelName)}&uid=${userUid}`),
        fetch('/api/agora/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: channelName, userUid }),
        }),
      ]);
      const tokenData = await tokenRes.json();
      const joinData = await joinRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error || 'Token failed');
      if (!joinRes.ok) {
        throw new Error(joinData.error || 'Agent join failed');
      }

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
      if (!appId) throw new Error('NEXT_PUBLIC_AGORA_APP_ID not set');
      await client.join(appId, channelName, tokenData.token, tokenData.uid);

      setVoiceActive(true);
      startVoiceZoomListener();

      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      mic.setEnabled(true);
      await client.publish([mic]);

      client.on('user-published', async (user, mediaType) => {
        if (mediaType === 'audio') {
          await client.subscribe(user, mediaType);
          user.audioTrack?.play();
          setVoiceProcessing(false);
          setAtlasSpeaking(true);
          if (agentSpeakingTimerRef.current) clearTimeout(agentSpeakingTimerRef.current);
          agentSpeakingTimerRef.current = setTimeout(() => {
            agentSpeakingTimerRef.current = null;
            setAtlasSpeaking(false);
          }, 15000);
        }
      });

      rtcClientRef.current = client;
      localAudioRef.current = mic;
      channelRef.current = channelName;
      greetingTimerRef.current = setTimeout(speakGreeting, 2200);
    } catch (e) {
      setVoiceActive(true);
      startBrowserVoiceListener();
      speakGreeting();
      const msg = e instanceof Error ? e.message : 'Voice start failed';
      if (!msg.includes('Agent join failed') && !msg.includes('400')) setVoiceError(msg);
    }
  };

  const stopVoice = () => {
    if (!voiceActive) return;
    setVoiceTranscript('');
    setVoiceProcessing(false);
    setAtlasSpeaking(false);
    if (agentSpeakingTimerRef.current) {
      clearTimeout(agentSpeakingTimerRef.current);
      agentSpeakingTimerRef.current = null;
    }
    if (agentProcessingTimerRef.current) {
      clearTimeout(agentProcessingTimerRef.current);
      agentProcessingTimerRef.current = null;
    }
    if (interimCommandTimerRef.current) {
      clearTimeout(interimCommandTimerRef.current);
      interimCommandTimerRef.current = null;
    }
    lastProcessedTranscriptRef.current = null;
    if (greetingTimerRef.current) {
      clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    localAudioRef.current?.close();
    localAudioRef.current = null;
    const client = rtcClientRef.current as { leave: () => Promise<void> } | null;
    if (client?.leave) {
      client.leave().catch(() => {});
    }
    rtcClientRef.current = null;
    channelRef.current = null;
    setVoiceActive(false);
  };

  useEffect(() => {
    return () => {
      if (voiceActive) {
        stopVoice();
      }
    };
  }, []);

  return (
    <div className="absolute bottom-3 left-0 right-0 z-10 flex flex-col items-center">
      {/* Messages (chat mode) — hide/show via chevron */}
      {!voiceMode && messages.length > 0 && (
        <>
          {messagesAreaVisible ? (
            <div className="mb-2 w-full max-w-xl rounded-lg bg-gray-800/95 text-xs shadow-lg">
              <div className="flex items-center justify-end border-b border-gray-600/50 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setMessagesAreaVisible(false)}
                  className="flex items-center gap-1 rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                  aria-label="Hide messages"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto px-3 py-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <span
                      className={
                        msg.role === 'user'
                          ? 'inline-block rounded-lg bg-blue-600/80 px-2 py-1 text-gray-100'
                          : 'inline-block rounded-lg bg-gray-700 px-2 py-1 text-gray-200'
                      }
                    >
                      {msg.content}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Atlas is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMessagesAreaVisible(true)}
              className="mb-2 flex w-full max-w-xl items-center justify-center gap-2 rounded-lg bg-gray-800/95 px-3 py-2 text-xs text-gray-300 shadow-lg hover:bg-gray-700/95"
              aria-label="Show messages"
            >
              <ChevronUp size={16} />
              <span>Show conversation ({messages.length} message{messages.length !== 1 ? 's' : ''})</span>
            </button>
          )}
        </>
      )}

      {/* Voice status + live transcript */}
      {voiceMode && (voiceActive || voiceError) && (
        <div className="mb-2 w-full max-w-xl space-y-1.5">
          <p className="rounded-lg bg-amber-900/30 px-3 py-1.5 text-[10px] text-amber-200/90">
            Tip: The greeting plays from your device; listening uses the browser’s online speech-to-text. If you see a network error, disable ad blocker for this site, try Incognito, or Chrome. With USE_LOCAL_LLM + AGORA_LLM_PROXY_URL set, the reply uses your local LLM.
          </p>
          {voiceTranscript ? (
            <div className="rounded-lg bg-gray-800/95 px-3 py-2 text-xs">
              <span className="text-gray-400">You: </span>
              <span className="text-gray-200">{voiceTranscript}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 rounded-lg bg-gray-800/95 px-3 py-2 text-xs">
            {voiceError ? (
              <span className="text-red-400">{voiceError}</span>
            ) : atlasSpeaking ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <span className="text-emerald-300">Atlas is speaking…</span>
              </>
            ) : loading || voiceProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin text-amber-400" />
                <span className="text-amber-400">Got it. Atlas is processing your request…</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-gray-300">Listening… Say &quot;Hey Atlas&quot; then your command.</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-gray-800 bg-opacity-75 p-1.5 shadow-lg ring-1 ring-white/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!voiceMode) sendChat();
            }
          }}
          placeholder={
            voiceMode
              ? 'Switch to chat to type...'
              : 'Type something for Atlas to do...'
          }
          className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white placeholder-gray-400 focus:outline-none"
          disabled={voiceMode}
        />
        {voiceMode ? (
          <button
            type="button"
            onClick={voiceActive ? stopVoice : startVoice}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              voiceActive
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            aria-label={voiceActive ? 'Stop voice' : 'Start voice'}
          >
            {voiceActive ? (
              <MicOff size={16} className="text-white" />
            ) : (
              <Mic size={16} className="text-white" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={sendChat}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} className="text-white" />
          </button>
        )}
        <ToggleSwitch value={voiceMode} onChange={onVoiceModeChange} />
      </div>
    </div>
  );
}
