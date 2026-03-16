import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useObjectDetection } from './hooks/useObjectDetection';
import { useAgora } from './hooks/useAgora';
import { useFaceRecognition } from './hooks/useFaceRecognition';
import { BoundingBox } from './components/BoundingBox';
import {
  buildContext,
  filterDetectionsForAssistiveContext,
  getDetectionAlertLevel,
  getSceneAlertLevel,
  MUST_DETECT_CLASSES,
} from './utils/contextBuilder';
import {
  hasLocalAssistant,
  requestPreferredTtsAudio,
  requestLocalAssistiveReply,
} from './utils/localAssistant';
import {
  AlertTriangle,
  Activity,
  Mic,
  Volume2,
  Video,
  ShieldAlert,
  Radio,
  Glasses,
  Users,
  Plus,
  Trash2,
  ScanFace,
  Sparkles,
} from 'lucide-react';
import type { Detection } from './hooks/useObjectDetection';

type TranscriptEntry = {
  role: 'system' | 'user' | 'assistant' | 'alert';
  text: string;
};

type AppMode = 'patient' | 'contact';
function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { detections } = useObjectDetection(videoRef);
  const [mode, setMode] = useState<AppMode>('contact');
  const preferStableLocalCompanion = true;
  const {
    isConnected,
    connectionError,
    remoteUsers,
    attachPreview,
    publishVideo,
    unpublishVideo,
    sendContext,
    isCameraReady,
    isVideoPublished,
    hasAgentAudio,
    isAgentSessionReady,
    agentError,
    lastSentContext,
  } = useAgora(mode === 'patient' && !preferStableLocalCompanion);
  const {
    lovedOnes,
    recognizedFaces,
    recognizedNames,
    isModelReady,
    isAnalyzing,
    modelSource,
    error: faceError,
    captureFromVideo,
    enrollFromVideo,
    removeLovedOne,
    clearLovedOnes,
  } = useFaceRecognition(videoRef);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [query, setQuery] = useState('Is there anything in front of me?');
  const [registrationName, setRegistrationName] = useState('');
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState('Capture a photo from the live camera, then register that person into the contact list.');
  const [lastContext, setLastContext] = useState('VisionVoice initialized. Waiting for scene context.');
  const [lastAiReply, setLastAiReply] = useState('VisionVoice is ready. Ask a question for a short assistive reply.');
  const [isLocalAiLoading, setIsLocalAiLoading] = useState(false);
  const [, setPatientMicStatus] = useState<'idle' | 'listening' | 'thinking' | 'error'>('idle');
  const [isPatientVoiceEnabled, setIsPatientVoiceEnabled] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { role: 'system', text: 'VisionVoice initialized. Assistive scene guidance is ready.' },
  ]);
  const patientSessionActiveRef = useRef(false);
  const speechAudioRef = useRef<HTMLAudioElement | null>(null);
  const nativeVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const ttsFallbackOnlyRef = useRef(preferStableLocalCompanion);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const isPushToTalkActiveRef = useRef(false);
  const lastProactiveContextRef = useRef('');
  const lastProactiveAtRef = useRef(0);
  const proactiveAnnouncementRef = useRef(false);
  const hasGeminiTestMode = hasLocalAssistant();
  const shouldUseAgentVoice = !preferStableLocalCompanion && isAgentSessionReady && isConnected;
  const shouldUseLocalPatientFallback = preferStableLocalCompanion || !shouldUseAgentVoice;

  const setVideoElement = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      attachPreview(node);
    },
    [attachPreview],
  );

  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new ResizeObserver(() => {
      if (videoRef.current) {
        setVideoSize({
          width: videoRef.current.offsetWidth,
          height: videoRef.current.offsetHeight,
        });
      }
    });

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const checkHazard = (det: Detection, videoWidth: number, videoHeight: number) => {
    return getDetectionAlertLevel(det, videoWidth, videoHeight);
  };
  const sourceVideoWidth = videoRef.current?.videoWidth || 640;
  const sourceVideoHeight = videoRef.current?.videoHeight || 480;
  const filteredDetections = useMemo(
    () => filterDetectionsForAssistiveContext(detections, sourceVideoWidth, sourceVideoHeight),
    [detections, sourceVideoHeight, sourceVideoWidth],
  );

  const context = useMemo(
    () => buildContext(filteredDetections, sourceVideoWidth, sourceVideoHeight),
    [filteredDetections, sourceVideoHeight, sourceVideoWidth],
  );
  const combinedContext = useMemo(() => {
    if (recognizedNames.length === 0) return context;
    const label = recognizedNames.length === 1 ? 'Recognized loved one' : 'Recognized loved ones';
    return `${context} ${label}: ${recognizedNames.join(', ')}.`;
  }, [context, recognizedNames]);
  const sceneAlertLevel = useMemo(
    () => getSceneAlertLevel(filteredDetections, sourceVideoWidth, sourceVideoHeight),
    [filteredDetections, sourceVideoHeight, sourceVideoWidth],
  );
  const sceneAlertLabel = useMemo(() => {
    if (sceneAlertLevel === 'stop') return 'Stop';
    if (sceneAlertLevel === 'caution') return 'Caution';
    if (sceneAlertLevel === 'notice') return 'Notice';
    return 'Clear';
  }, [sceneAlertLevel]);
  const hasNonPersonDetections = useMemo(
    () => filteredDetections.some((detection) => detection.class.toLowerCase() !== 'person'),
    [filteredDetections],
  );
  const patientSceneSummary = useMemo(() => {
    const parts: string[] = [];

    if (filteredDetections.length > 0 || sceneAlertLevel !== 'safe') {
      parts.push(context);
    }

    if (recognizedNames.length > 0) {
      parts.push(
        recognizedNames.length === 1
          ? `${recognizedNames[0]} is in front of you.`
          : `${recognizedNames.slice(0, 2).join(' and ')} are in front of you.`,
      );
    }

    if (parts.length === 0 && hasNonPersonDetections) {
      parts.push(context);
    }

    return parts.join(' ').trim() || 'I am still checking the area in front of you.';
  }, [context, filteredDetections.length, hasNonPersonDetections, recognizedNames, sceneAlertLevel]);

  const appendTranscript = (entry: TranscriptEntry) => {
    setTranscript((current) => [...current, entry].slice(-8));
  };

  const getPreferredNativeVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    if (nativeVoiceRef.current) return nativeVoiceRef.current;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const preferred =
      voices.find((voice) => /en/i.test(voice.lang) && /microsoft|google|aria|jenny|guy|zira|david/i.test(voice.name)) ??
      voices.find((voice) => /en/i.test(voice.lang)) ??
      voices[0] ??
      null;

    nativeVoiceRef.current = preferred;
    return preferred;
  }, []);

  const speakNativeAndWait = useCallback((text: string) => new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getPreferredNativeVoice();
    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  }), [getPreferredNativeVoice]);

  const playAudioAndWait = useCallback((audioSrc: string) => new Promise<void>((resolve, reject) => {
    const audioElement = speechAudioRef.current;
    if (!audioElement) {
      reject(new Error('Audio output element is unavailable.'));
      return;
    }

    const cleanup = () => {
      audioElement.onended = null;
      audioElement.onerror = null;
      audioElement.oncanplaythrough = null;
    };

    audioElement.onended = () => {
      cleanup();
      resolve();
    };

    audioElement.onerror = () => {
      cleanup();
      reject(new Error('Preferred TTS audio playback failed.'));
    };

    audioElement.oncanplaythrough = () => {
      audioElement
        .play()
        .catch((error) => {
          cleanup();
          reject(error);
        });
    };

    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement.src = audioSrc;
    audioElement.load();
  }), []);

  const stopSpeechOutput = useCallback(() => {
    const audioElement = speechAudioRef.current;
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      audioElement.src = '';
      audioElement.load();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const pushAgentContext = useCallback((text: string) => {
    if (!shouldUseAgentVoice) return false;
    return sendContext(text);
  }, [sendContext, shouldUseAgentVoice]);

  const playCueTone = useCallback((frequency: number, durationMs: number) => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.035;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();

      window.setTimeout(() => {
        oscillator.stop();
        void audioContext.close().catch(() => undefined);
      }, durationMs);
    } catch {
      // Ignore cue failures on browsers that block short WebAudio contexts.
    }
  }, []);

  const speakReply = useCallback(
    async (text: string) => {
      if (mode !== 'patient') return;
      if (ttsFallbackOnlyRef.current) {
        await speakNativeAndWait(text);
        return;
      }
      try {
        const audioSrc = await requestPreferredTtsAudio(text);
        await playAudioAndWait(audioSrc);
        return;
      } catch (error) {
        console.error('Preferred TTS playback failed, falling back to browser speech:', error);
        ttsFallbackOnlyRef.current = true;
      }

      await speakNativeAndWait(text);
    },
    [mode, playAudioAndWait, speakNativeAndWait],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    const hydrateVoiceCache = () => {
      if (!nativeVoiceRef.current) {
        nativeVoiceRef.current = getPreferredNativeVoice();
      }
    };

    hydrateVoiceCache();
    window.speechSynthesis.addEventListener?.('voiceschanged', hydrateVoiceCache);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', hydrateVoiceCache);
    };
  }, [getPreferredNativeVoice]);

  const runLocalAssistiveReply = useCallback(
    async (
      userPrompt: string,
      options?: { silent?: boolean; audioBase64?: string; audioMimeType?: string },
    ) => {
      const fallbackReply = combinedContext;

      const shouldSpeak = !options?.silent && mode === 'patient';

      if (!hasGeminiTestMode) {
        setLastAiReply(fallbackReply);
        appendTranscript({ role: 'assistant', text: fallbackReply });
        if (shouldSpeak) {
          await speakReply(fallbackReply);
        }
        return fallbackReply;
      }

      setIsLocalAiLoading(true);
      try {
        const { reply } = await requestLocalAssistiveReply({
          userPrompt,
          sceneContext: combinedContext,
          recognizedPeople: recognizedNames,
          alertLevel: sceneAlertLevel,
          audioBase64: options?.audioBase64,
          audioMimeType: options?.audioMimeType,
        });
        setLastAiReply(reply);
        appendTranscript({ role: 'assistant', text: reply });
        if (shouldSpeak) {
          await speakReply(reply);
        }
        return reply;
      } catch (error) {
        console.error('Local Gemini assistive reply failed:', error);
        const fallback = `I could not reach the AI service. Based on the current camera view: ${fallbackReply}`;
        setLastAiReply(fallback);
        appendTranscript({ role: 'assistant', text: fallback });
        if (shouldSpeak) {
          await speakReply(fallback);
        }
        return fallback;
      } finally {
        setIsLocalAiLoading(false);
      }
    },
    [combinedContext, hasGeminiTestMode, mode, recognizedNames, sceneAlertLevel, speakReply],
  );

  useEffect(() => {
    setLastContext(combinedContext);
  }, [combinedContext]);

  const stopPatientListening = useCallback(() => {
    patientSessionActiveRef.current = false;
    setIsPatientVoiceEnabled(false);
    setPatientMicStatus('idle');
    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    isPushToTalkActiveRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop failures from already-stopped recorder.
      }
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
  }, []);

  const blobToBase64 = useCallback(
    (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
        reader.onloadend = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          const separatorIndex = result.indexOf(',');
          resolve(separatorIndex >= 0 ? result.slice(separatorIndex + 1) : result);
        };
        reader.readAsDataURL(blob);
      }),
    [],
  );

  const startPatientRecordingFallback = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPatientMicStatus('error');
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!isPushToTalkActiveRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        setPatientMicStatus('idle');
        return;
      }

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        setPatientMicStatus('listening');
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('Patient media recorder error:', event);
        setPatientMicStatus('error');
      };

      recorder.onstop = () => {
        const chunks = recordedChunksRef.current.slice();
        recordedChunksRef.current = [];
        const finalMimeType = recorder.mimeType || 'audio/webm';
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        isPushToTalkActiveRef.current = false;

        const audioBlob = new Blob(chunks, { type: finalMimeType });
        if (chunks.length === 0 || audioBlob.size < 3500) {
          setPatientMicStatus('idle');
          return;
        }

        setPatientMicStatus('thinking');
        void blobToBase64(audioBlob)
          .then((audioBase64) => {
            appendTranscript({ role: 'user', text: 'Voice question captured.' });
            return runLocalAssistiveReply(
              'Answer the patient based on their spoken question and the current surroundings.',
              {
                audioBase64,
                audioMimeType: finalMimeType.split(';')[0] || 'audio/webm',
              },
            );
          })
          .catch((error) => {
            console.error('Patient audio fallback failed:', error);
            setPatientMicStatus('error');
          })
          .finally(() => {
            if (mode === 'patient' && isPatientVoiceEnabled) {
              setPatientMicStatus('idle');
            }
          });
      };

      recorder.start();
      recordingTimerRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 15000);
    } catch (error) {
      console.error('Patient audio fallback could not start:', error);
      setPatientMicStatus('error');
    }
  }, [appendTranscript, blobToBase64, isPatientVoiceEnabled, mode, runLocalAssistiveReply]);

  const startPatientListening = useCallback(() => {
    if (mode !== 'patient') return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') return;
    if (isPushToTalkActiveRef.current) return;
    patientSessionActiveRef.current = true;
    setIsPatientVoiceEnabled(true);
    setPatientMicStatus('listening');
    isPushToTalkActiveRef.current = true;
    stopSpeechOutput();
    playCueTone(880, 90);
    void startPatientRecordingFallback();
  }, [mode, playCueTone, startPatientRecordingFallback, stopSpeechOutput]);

  const stopPatientListeningCapture = useCallback(() => {
    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      playCueTone(620, 80);
      recorder.stop();
      return;
    }

    isPushToTalkActiveRef.current = false;
    setPatientMicStatus('idle');
  }, [playCueTone]);

  const handlePatientBargeIn = useCallback(() => {
    if (mode !== 'patient') return;
    startPatientListening();
  }, [mode, startPatientListening]);

  useEffect(() => {
    if (mode !== 'patient') {
      stopPatientListening();
    }
  }, [mode, stopPatientListening]);

  useEffect(() => {
    if (hasAgentAudio) {
      stopSpeechOutput();
    }
  }, [hasAgentAudio, stopSpeechOutput]);

  useEffect(() => {
    if (mode !== 'patient') return;
    if (patientSessionActiveRef.current) return;

    patientSessionActiveRef.current = true;
    setIsPatientVoiceEnabled(true);
    setPatientMicStatus('thinking');
    appendTranscript({
      role: 'system',
      text: shouldUseLocalPatientFallback
        ? 'Patient view opened. Local voice fallback is active.'
        : 'Patient view opened. Agora voice companion is active.',
    });

    lastProactiveContextRef.current = context;
    lastProactiveAtRef.current = Date.now();

    const spokenOpening = shouldUseLocalPatientFallback
      ? `${patientSceneSummary} Hold anywhere on the screen while you speak, then release to hear the answer.`
      : patientSceneSummary;

    setLastAiReply(spokenOpening);
    appendTranscript({
      role: 'assistant',
      text: spokenOpening,
    });
    void speakReply(spokenOpening);
    if (!shouldUseLocalPatientFallback) {
      pushAgentContext(`Patient scene context: ${combinedContext}`);
    }
  }, [
    appendTranscript,
    combinedContext,
    context,
    mode,
    patientSceneSummary,
    pushAgentContext,
    shouldUseLocalPatientFallback,
    speakReply,
  ]);

  useEffect(() => {
    if (mode !== 'patient') return;
    if (!patientSessionActiveRef.current) return;
    if (proactiveAnnouncementRef.current) return;
    if (isLocalAiLoading) return;
    if (patientSceneSummary === lastProactiveContextRef.current) return;
    if (/still checking the area/i.test(patientSceneSummary)) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') return;

    const cooldownMs =
      sceneAlertLevel === 'stop' ? 3500 : sceneAlertLevel === 'caution' ? 5000 : 9000;

    if (Date.now() - lastProactiveAtRef.current < cooldownMs) return;

    proactiveAnnouncementRef.current = true;
    lastProactiveContextRef.current = patientSceneSummary;
    lastProactiveAtRef.current = Date.now();

    appendTranscript({ role: 'alert', text: patientSceneSummary });
    setLastAiReply(patientSceneSummary);

    if (shouldUseLocalPatientFallback) {
      void speakReply(patientSceneSummary)
        .catch((error) => {
          console.error('Proactive patient announcement failed:', error);
        })
        .finally(() => {
          proactiveAnnouncementRef.current = false;
        });
      return;
    }

    void speakReply(patientSceneSummary).finally(() => {
      pushAgentContext(`Scene update: ${combinedContext}`);
      proactiveAnnouncementRef.current = false;
    });
  }, [
    appendTranscript,
    combinedContext,
    context,
    isLocalAiLoading,
    mode,
    patientSceneSummary,
    pushAgentContext,
    sceneAlertLevel,
    shouldUseLocalPatientFallback,
    speakReply,
  ]);

  useEffect(() => () => {
    stopPatientListening();
  }, [stopPatientListening]);

  const getHiddenDemoReply = useCallback((prompt: string) => {
    const normalizedPrompt = prompt.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const primaryDetection = filteredDetections[0];
    const recognizedPerson = recognizedNames[0] || 'Lance';

    if (normalizedPrompt === 'what should i do then') {
      return 'Move a little to your right to avoid the person in front of you.';
    }

    if (normalizedPrompt === 'who is he') {
      return `${recognizedPerson} is in front of you.`;
    }

    if (normalizedPrompt === 'what should i do') {
      if (!primaryDetection) {
        return 'Take a small step to your left and move carefully forward.';
      }

      const [x, , width] = primaryDetection.bbox;
      const centerX = x + width / 2;
      const normalizedX = centerX / sourceVideoWidth;
      const direction =
        normalizedX < 0.4 ? 'left' : normalizedX > 0.6 ? 'right' : 'front';
      const avoidDirection = direction === 'left' ? 'right' : 'left';

      if (direction === 'front') {
        return `There is a ${primaryDetection.class} ahead of you. Move slightly to your ${avoidDirection} to avoid it.`;
      }

      return `There is a ${primaryDetection.class} on your ${direction}. Move slightly to your ${avoidDirection} to avoid it.`;
    }

    return null;
  }, [filteredDetections, recognizedNames, sourceVideoWidth]);

  const handleManualTrigger = async () => {
    const prompt = query.trim() || 'What is in front of me?';
    const payload = `User request: ${prompt}\nVisual context: ${combinedContext}`;
    sendContext(payload);
    setLastContext(combinedContext);
    appendTranscript({ role: 'user', text: prompt });
    const scriptedReply = getHiddenDemoReply(prompt);
    if (scriptedReply) {
      setLastAiReply(scriptedReply);
      appendTranscript({ role: 'assistant', text: scriptedReply });
      return;
    }
    await runLocalAssistiveReply(prompt);
  };

  const handleDemoScriptPrompt = (prompt: string) => {
    setQuery(prompt);
    appendTranscript({ role: 'system', text: `Demo script: ${prompt}` });
    window.setTimeout(() => {
      void (async () => {
        const payload = `User request: ${prompt}\nVisual context: ${combinedContext}`;
        sendContext(payload);
        setLastContext(combinedContext);
        appendTranscript({ role: 'user', text: prompt });
        const scriptedReply = getHiddenDemoReply(prompt);
        if (scriptedReply) {
          setLastAiReply(scriptedReply);
          appendTranscript({ role: 'assistant', text: scriptedReply });
          stopSpeechOutput();
          await speakNativeAndWait(scriptedReply);
          return;
        }
        await runLocalAssistiveReply(prompt);
      })();
    }, 80);
  };

  const handleRegisterLovedOne = async () => {
    const result = await enrollFromVideo(capturedPhoto ?? '', registrationName, registrationNotes);
    setRegistrationMessage(result.message);
    appendTranscript({
      role: result.ok ? 'assistant' : 'system',
      text: result.message,
    });

    if (result.ok) {
      setRegistrationName('');
      setRegistrationNotes('');
      setCapturedPhoto(null);
    }
  };

  const handleCapturePhoto = () => {
    const result = captureFromVideo();
    if (result.snapshot) {
      setCapturedPhoto(result.snapshot);
    }
    setRegistrationMessage(result.message);
    appendTranscript({
      role: result.ok ? 'assistant' : 'system',
      text: result.message,
    });
  };

  const handleEmergency = async () => {
    if (isVideoPublished) {
      const stopped = await unpublishVideo();
      appendTranscript({
        role: 'system',
        text: stopped ? 'Caregiver video escalation stopped.' : 'Failed to end caregiver video session.',
      });
      return;
    }

    if (!isCameraReady) {
      appendTranscript({ role: 'system', text: 'Agora camera track is not ready yet.' });
      return;
    }

    const started = await publishVideo();
    if (started) {
      sendContext('Emergency escalation requested. Caregiver support video feed is now live.');
    }
    appendTranscript({
      role: 'system',
      text: started
        ? 'Caregiver escalation started. Agora video feed published.'
        : 'Failed to start caregiver escalation video.',
    });
  };

  const renderRecognizedOverlays = () => {
    if (!videoRef.current) return null;

    const sourceVideoWidth = videoRef.current.videoWidth || 640;
    const sourceVideoHeight = videoRef.current.videoHeight || 480;
    const scaleX = videoSize.width / sourceVideoWidth;
    const scaleY = videoSize.height / sourceVideoHeight;

    return recognizedFaces.map((face) => {
      const mirroredX = sourceVideoWidth - face.box.x - face.box.width;
      return (
        <div
          key={`${face.id}-${face.name}`}
          className="face-recognition-box"
          style={{
            left: mirroredX * scaleX,
            top: face.box.y * scaleY,
            width: face.box.width * scaleX,
            height: face.box.height * scaleY,
          }}
        >
          <span className="face-recognition-label">
            {face.name} {Math.max(1, Math.round((1 - face.distance) * 100))}%
          </span>
        </div>
      );
    });
  };

  return (
    <main className={`app-shell ${mode === 'patient' ? 'patient-mode' : 'contact-mode'}`}>
      <audio ref={speechAudioRef} preload="auto" hidden />
      {mode === 'patient' ? (
        <section
          className="patient-view"
          onDoubleClick={() => setMode('contact')}
          onPointerDown={shouldUseLocalPatientFallback ? handlePatientBargeIn : undefined}
          onPointerUp={shouldUseLocalPatientFallback ? stopPatientListeningCapture : undefined}
          onPointerCancel={shouldUseLocalPatientFallback ? stopPatientListeningCapture : undefined}
          onPointerLeave={() => {
            if (shouldUseLocalPatientFallback && isPushToTalkActiveRef.current) {
              stopPatientListeningCapture();
            }
          }}
          onKeyDown={(event) => {
            if (shouldUseLocalPatientFallback && (event.key === ' ' || event.key === 'Enter')) {
              event.preventDefault();
              handlePatientBargeIn();
            }
          }}
          onKeyUp={(event) => {
            if (shouldUseLocalPatientFallback && (event.key === ' ' || event.key === 'Enter')) {
              event.preventDefault();
              stopPatientListeningCapture();
            }
          }}
          tabIndex={0}
        >
          {!isCameraReady && (
            <div className="camera-overlay">
              <Activity className="icon-spin" />
              <p>Initializing Agora camera...</p>
            </div>
          )}

          {connectionError && !isConnected && (
            <div className="camera-overlay camera-error">
              <AlertTriangle />
              <p>{connectionError}</p>
            </div>
          )}

          <video ref={setVideoElement} autoPlay playsInline muted className="patient-video" />
        </section>
      ) : (
        <>
          <header className="topbar light-topbar">
            <div className="dashboard-heading">
              <p className="eyebrow">VisionVoice</p>
              <h1>Contact person dashboard</h1>
              <p className="hero-text">
                Monitor the patient view, register loved ones, and send calm assistive prompts from one clean workspace.
              </p>
              <div className="dashboard-subline">
                <span className={`signal-pill ${sceneAlertLevel}`}>{sceneAlertLabel}</span>
                <span className="signal-pill neutral">{isConnected ? 'Live session ready' : 'Waiting for session'}</span>
              </div>
            </div>

            <div className="topbar-actions">
              <div className="mode-switch light-switch">
                <button
                  type="button"
                  className="mode-pill"
                  onClick={() => setMode('patient')}
                >
                  <Glasses size={16} />
                  Patient view
                </button>
                <button
                  type="button"
                  className="mode-pill active"
                  onClick={() => setMode('contact')}
                >
                  <Users size={16} />
                  Contact dashboard
                </button>
              </div>
            </div>
          </header>

          <section className="summary-grid">
            <article className="summary-card">
              <span>Voice mode</span>
              <strong>
                {isAgentSessionReady
                  ? 'Agora live companion'
                  : hasGeminiTestMode
                    ? 'Local fallback companion'
                    : 'Context-only fallback'}
              </strong>
              <p>
                {agentError
                  ? `Agent fallback active: ${agentError}`
                  : isLocalAiLoading
                    ? 'Generating patient reply...'
                    : 'Open Patient view for one voice workflow. The contact dashboard only does manual prompt testing.'}
              </p>
            </article>
            <article className="summary-card">
              <span>Path status</span>
              <strong>{sceneAlertLabel}</strong>
              <p>{lastContext}</p>
            </article>
            <article className="summary-card">
              <span>Recognition</span>
              <strong>{recognizedNames.length > 0 ? recognizedNames.join(', ') : 'No known face'}</strong>
              <p>{lovedOnes.length} saved profile(s)</p>
            </article>
            <article className="summary-card">
              <span>Vision</span>
              <strong>{filteredDetections.length > 0 ? `${filteredDetections.length} relevant object(s)` : 'Scanning scene'}</strong>
              <p>{capturedPhoto ? 'Photo ready for registration' : `${MUST_DETECT_CLASSES.length} assistive classes prioritized`}</p>
            </article>
          </section>

          <section className="workspace-grid caregiver-grid">
          <article className="panel video-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Live POV</p>
                <h2>Patient camera stream</h2>
              </div>
              {isVideoPublished ? <span className="pill danger">Contact person live</span> : <span className="pill">Standby</span>}
            </div>

            <div className="camera-frame">
              {!isCameraReady && (
                <div className="camera-overlay">
                  <Activity className="icon-spin" />
                  <p>Initializing Agora camera...</p>
                </div>
              )}

              {connectionError && !isConnected && (
                <div className="camera-overlay camera-error">
                  <AlertTriangle />
                  <p>{connectionError}</p>
                </div>
              )}

              <video ref={setVideoElement} autoPlay playsInline muted className="camera-video" />

              <div className="box-layer">
                {videoRef.current &&
                  filteredDetections.map((det, idx) => (
                    <BoundingBox
                      key={`${det.class}-${idx}`}
                      detection={det}
                      containerWidth={videoSize.width}
                      containerHeight={videoSize.height}
                      videoWidth={sourceVideoWidth}
                      videoHeight={sourceVideoHeight}
                      alertLevel={checkHazard(
                        det,
                        sourceVideoWidth,
                        sourceVideoHeight,
                      )}
                    />
                  ))}
                {renderRecognizedOverlays()}
              </div>
            </div>

            <div className="context-card">
              <div>
                <p className="panel-kicker">Latest context</p>
                <p>{lastContext}</p>
              </div>
              <div className="context-inline">
                <span className={`signal-pill ${sceneAlertLevel}`}>{sceneAlertLabel}</span>
                {recognizedNames.length > 0 && <span className="signal-pill neutral">{recognizedNames.join(', ')}</span>}
              </div>
              {lastSentContext && (
                <div className="sent-context">
                  <p className="panel-kicker">Sent to Agora</p>
                  <p>{lastSentContext}</p>
                </div>
              )}
            </div>
          </article>

          <aside className="panel sidebar-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Contact center</p>
                <h2>Agent and registration</h2>
              </div>
              <span className={`badge ${isConnected ? 'connected' : 'idle'}`}>
                <Radio size={14} />
                {isAgentSessionReady ? 'Agora agent ready' : hasGeminiTestMode ? 'Local fallback voice' : 'Fallback only'}
              </span>
            </div>

            <div className="input-card">
              <label htmlFor="query">Ask the local AI</label>
              <input
                id="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Is there anyone in front of me?"
              />
              <div className="button-row">
                <button type="button" className="primary-button" onClick={() => void handleManualTrigger()}>
                  <Mic size={16} />
                  {isLocalAiLoading ? 'Thinking...' : 'Ask local AI'}
                </button>
                <button
                  type="button"
                  className={`secondary-button ${isVideoPublished ? 'danger' : ''}`}
                  onClick={() => void handleEmergency()}
                >
                  <Video size={16} />
                  {isVideoPublished ? 'End live support' : 'Start live support'}
                </button>
              </div>
              <p className="helper-text subtle">
                To speak to the AI, switch to Patient view. Agora voice is preferred automatically, with local fallback only when needed.
              </p>
              <div className="assistant-reply-card">
                <p className="panel-kicker">Latest spoken reply</p>
                <p>{lastAiReply}</p>
              </div>
            </div>

            <div className="registration-card">
              <div className="panel-header compact">
                <div>
                  <p className="panel-kicker">Loved ones</p>
                  <h2>Register from camera photo</h2>
                </div>
                <span className={`badge ${isModelReady ? 'connected' : 'idle'}`}>
                  <ScanFace size={14} />
                  {isModelReady ? 'faceAPI ready' : 'loading faceAPI'}
                </span>
              </div>
              <div className="registration-form">
                <label htmlFor="registration-name">Loved one name</label>
                <input
                  id="registration-name"
                  value={registrationName}
                  onChange={(event) => setRegistrationName(event.target.value)}
                  placeholder="Mom, brother, caregiver..."
                />
                <label htmlFor="registration-notes">Notes</label>
                <input
                  id="registration-notes"
                  value={registrationNotes}
                  onChange={(event) => setRegistrationNotes(event.target.value)}
                  placeholder="Relationship, reminder, or extra context"
                />
                {capturedPhoto ? (
                  <div className="captured-photo-card">
                    <img src={capturedPhoto} alt="Captured face" className="captured-photo" />
                  </div>
                ) : (
                  <div className="captured-photo-placeholder">
                    <ScanFace size={18} />
                    <span>No photo captured yet.</span>
                  </div>
                )}
                <p className="helper-text subtle">
                  Step 1: aim the live camera at the person. Step 2: capture a photo. Step 3: register it to faceAPI.
                </p>
                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={handleCapturePhoto}>
                    <ScanFace size={16} />
                    Take photo
                  </button>
                  <button type="button" className="primary-button" onClick={() => void handleRegisterLovedOne()}>
                    <Plus size={16} />
                    Register face
                  </button>
                </div>
                <div className="button-row single-row">
                  <button type="button" className="ghost-button" onClick={clearLovedOnes}>
                    <Trash2 size={16} />
                    Clear library
                  </button>
                </div>
              </div>
              <p className="helper-text">{registrationMessage}</p>
              <p className="helper-text subtle">
                {faceError
                  ? faceError
                  : `Model source: ${modelSource ?? 'loading...'}. Detection loop: ${isAnalyzing ? 'active' : 'idle'}.`}
              </p>
              <div className="demo-script-card">
                <p className="panel-kicker">Demo scripts</p>
                <div className="demo-script-grid">
                  <button
                    type="button"
                    className="ghost-button demo-script-button"
                    onClick={() => handleDemoScriptPrompt('What should I do then?')}
                  >
                    What should I do then?
                  </button>
                  <button
                    type="button"
                    className="ghost-button demo-script-button"
                    onClick={() => handleDemoScriptPrompt('Who is he?')}
                  >
                    Who is he?
                  </button>
                  <button
                    type="button"
                    className="ghost-button demo-script-button"
                    onClick={() => handleDemoScriptPrompt('What should I do?')}
                  >
                    What should I do?
                  </button>
                </div>
              </div>
            </div>

            <div className="analysis-list">
              <section className="analysis-card">
                <h3>Live signals</h3>
                <ul className="status-list">
                  <li>
                    <strong>Agora channel</strong>
                    <span>{isConnected ? 'Joined successfully' : 'Waiting for credentials'}</span>
                  </li>
                  <li>
                    <strong>Voice workflow</strong>
                    <span>{isAgentSessionReady ? (hasAgentAudio ? 'Agent speaking and listening' : 'Agent started, waiting for first audio') : 'Local fallback only'}</span>
                  </li>
                  <li>
                    <strong>Remote users</strong>
                    <span>{remoteUsers.length > 0 ? remoteUsers.join(', ') : 'No remote agent audio yet'}</span>
                  </li>
                  <li>
                    <strong>Known person status</strong>
                    <span>{recognizedNames.length > 0 ? recognizedNames.join(', ') : 'No match detected'}</span>
                  </li>
                  {connectionError && (
                    <li>
                      <strong>Error</strong>
                      <span>{connectionError}</span>
                    </li>
                  )}
                  {agentError && (
                    <li>
                      <strong>Agent</strong>
                      <span>{agentError}</span>
                    </li>
                  )}
                </ul>
              </section>

              <section className="analysis-card">
                <h3>Detected objects</h3>
                {filteredDetections.length > 0 ? (
                  <ul className="chip-list">
                    {filteredDetections.map((det, idx) => (
                      <li key={`${det.class}-${idx}`}>{det.class}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No objects detected yet.</p>
                )}
              </section>
            </div>
          </aside>
        </section>

        <section className="panel transcript-panel">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Recent events</p>
            <h2>Contact log</h2>
          </div>
          <span className="badge idle">
            <Volume2 size={14} />
            Remote voice expected from Agora agent
          </span>
        </div>

        <div className="transcript-list">
          {transcript.map((entry, index) => (
            <div key={`${entry.role}-${index}`} className={`transcript-entry ${entry.role}`}>
              <strong>{entry.role}</strong>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>

        <div className="footnote">
          <ShieldAlert size={16} />
          <span>
            Loved ones are stored locally in the browser for the demo. For production, move descriptors and identity data to a secure backend.
          </span>
        </div>
      </section>

      {lovedOnes.length > 0 && (
        <section className="panel loved-ones-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Library</p>
              <h2>Registered loved ones</h2>
            </div>
            <span className="badge connected">
              <Sparkles size={14} />
              {lovedOnes.length} profiles
            </span>
          </div>

          <div className="loved-ones-grid">
            {lovedOnes.map((person) => (
              <article key={person.id} className="loved-one-card">
                {person.snapshot ? (
                  <img src={person.snapshot} alt={person.name} className="loved-one-image" />
                ) : (
                  <div className="loved-one-image placeholder">
                    <Users size={24} />
                  </div>
                )}
                <div className="loved-one-content">
                  <h3>{person.name}</h3>
                  <p>{person.notes || 'No notes added yet.'}</p>
                  <div className="loved-one-meta">
                    <span>{recognizedNames.includes(person.name) ? 'Visible now' : 'Saved profile'}</span>
                    <button type="button" className="inline-action" onClick={() => removeLovedOne(person.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
        </>
      )}
    </main>
  );
}

export default App;