import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import * as faceapi from '@vladmandic/face-api';

export type LovedOne = {
  id: string;
  name: string;
  notes: string;
  descriptor: number[];
  createdAt: string;
  snapshot?: string;
  lastSeenAt?: string;
};

export type RecognizedFace = {
  id: string;
  name: string;
  distance: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const STORAGE_KEY = 'visionvoice-loved-ones';
const MATCH_THRESHOLD = 0.52;
const MODEL_SOURCES = [
  '/models',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
];
const DETECTOR_CONFIGS = [
  { inputSize: 512, scoreThreshold: 0.2 },
  { inputSize: 416, scoreThreshold: 0.2 },
  { inputSize: 320, scoreThreshold: 0.15 },
];

const loadStoredLovedOnes = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LovedOne[];
  } catch (error) {
    console.warn('Failed to read loved ones from storage:', error);
    return [];
  }
};

const saveLovedOnes = (lovedOnes: LovedOne[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lovedOnes));
};

const descriptorDistance = (a: number[], b: Float32Array | number[]) => {
  let sum = 0;
  for (let index = 0; index < a.length; index += 1) {
    const delta = a[index] - Number(b[index]);
    sum += delta * delta;
  }
  return Math.sqrt(sum);
};

const captureSnapshot = (video: HTMLVideoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
};

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load captured image.'));
    image.src = src;
  });

async function loadFaceModels() {
  let lastError: unknown = null;

  for (const source of MODEL_SOURCES) {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(source),
        faceapi.nets.faceLandmark68Net.loadFromUri(source),
        faceapi.nets.faceRecognitionNet.loadFromUri(source),
      ]);
      return source;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function detectFacesWithFallback(
  input: HTMLVideoElement | HTMLImageElement,
) {
  for (const config of DETECTOR_CONFIGS) {
    const detections = await faceapi
      .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions(config))
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      return detections;
    }
  }

  return [];
}

const getLargestDetection = <T extends { detection: { box: { width: number; height: number } } }>(
  detections: T[],
) =>
  detections.reduce<T | null>((largest, current) => {
    const currentArea = current.detection.box.width * current.detection.box.height;
    const largestArea = largest ? largest.detection.box.width * largest.detection.box.height : 0;
    return currentArea > largestArea ? current : largest;
  }, null);

export const useFaceRecognition = (videoRef: RefObject<HTMLVideoElement | null>) => {
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>(() => loadStoredLovedOnes());
  const [recognizedFaces, setRecognizedFaces] = useState<RecognizedFace[]>([]);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelSource, setModelSource] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setError(null);
        const source = await loadFaceModels();
        if (!isMounted) return;
        setModelSource(source);
        setIsModelReady(true);
      } catch (loadError) {
        console.error('Failed to load face-api models:', loadError);
        if (!isMounted) return;
        setError('Face recognition models could not be loaded.');
        setIsModelReady(false);
      }
    };

    void initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    saveLovedOnes(lovedOnes);
  }, [lovedOnes]);

  useEffect(() => {
    if (!isModelReady) return;

    let isCancelled = false;
    let timerId: number | null = null;

    const analyze = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || lovedOnes.length === 0) {
        if (!isCancelled) {
          setRecognizedFaces([]);
          timerId = window.setTimeout(analyze, 1200);
        }
        return;
      }

      try {
        setIsAnalyzing(true);
        const detections = await detectFacesWithFallback(video);

        if (isCancelled) return;

        const matches = detections
          .map((detection) => {
            const match = lovedOnes.reduce<{ lovedOne: LovedOne | null; distance: number }>(
              (best, lovedOne) => {
                const distance = descriptorDistance(lovedOne.descriptor, detection.descriptor);
                if (distance < best.distance) {
                  return { lovedOne, distance };
                }
                return best;
              },
              { lovedOne: null, distance: Number.POSITIVE_INFINITY },
            );

            if (!match.lovedOne || match.distance > MATCH_THRESHOLD) return null;

            return {
              id: match.lovedOne.id,
              name: match.lovedOne.name,
              distance: match.distance,
              box: {
                x: detection.detection.box.x,
                y: detection.detection.box.y,
                width: detection.detection.box.width,
                height: detection.detection.box.height,
              },
            } satisfies RecognizedFace;
          })
          .filter((item): item is RecognizedFace => item !== null);

        setRecognizedFaces(matches);
      } catch (analysisError) {
        console.error('Face recognition analysis failed:', analysisError);
      } finally {
        if (!isCancelled) {
          setIsAnalyzing(false);
          timerId = window.setTimeout(analyze, 1200);
        }
      }
    };

    void analyze();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [isModelReady, lovedOnes, videoRef]);

  const enrollFromVideo = useCallback(
    async (snapshot: string, name: string, notes: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return { ok: false, message: 'Enter a name before registering.' };
      }

      if (!isModelReady) {
        return { ok: false, message: 'Face recognition model is still loading.' };
      }

      if (!snapshot) {
        return { ok: false, message: 'Capture a photo first before registering.' };
      }

      try {
        const image = await loadImageElement(snapshot);
        const detections = await detectFacesWithFallback(image);
        const detection = getLargestDetection(detections);

        if (!detection) {
          return {
            ok: false,
            message: 'No face found in the captured photo. Move closer, face the camera, and try again.',
          };
        }

        const nextLovedOne: LovedOne = {
          id: crypto.randomUUID(),
          name: trimmedName,
          notes: notes.trim(),
          descriptor: Array.from(detection.descriptor),
          createdAt: new Date().toISOString(),
          snapshot,
          lastSeenAt: new Date().toISOString(),
        };

        setLovedOnes((current) => [...current, nextLovedOne]);
        return { ok: true, message: `${trimmedName} was registered successfully.` };
      } catch (enrollError) {
        console.error('Failed to register face:', enrollError);
        return { ok: false, message: 'Face registration failed. Try again in better lighting.' };
      }
    },
    [isModelReady],
  );

  const captureFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      return { ok: false, message: 'Camera preview is not ready yet.', snapshot: null };
    }

    const snapshot = captureSnapshot(video);
    if (!snapshot) {
      return { ok: false, message: 'Could not capture the current frame.', snapshot: null };
    }

    return { ok: true, message: 'Photo captured from live camera.', snapshot };
  }, [videoRef]);

  const removeLovedOne = useCallback((id: string) => {
    setLovedOnes((current) => current.filter((person) => person.id !== id));
  }, []);

  const clearLovedOnes = useCallback(() => {
    setLovedOnes([]);
  }, []);

  const recognizedNames = useMemo(
    () => Array.from(new Set(recognizedFaces.map((face) => face.name))),
    [recognizedFaces],
  );

  return {
    lovedOnes,
    recognizedFaces,
    recognizedNames,
    isModelReady,
    isAnalyzing,
    modelSource,
    error,
    captureFromVideo,
    enrollFromVideo,
    removeLovedOne,
    clearLovedOnes,
  };
};
