import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export const useObjectDetection = (
  videoRef: RefObject<HTMLVideoElement | null>,
  isEnabled: boolean = true,
) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const requestRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoadingModel(true);
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("COCO-SSD model loaded");
      } catch (err) {
        console.error("Failed to load COCO-SSD model:", err);
      } finally {
        setIsLoadingModel(false);
      }
    };
    loadModel();
  }, []);

  const detect = async () => {
    if (!isRunningRef.current) return;

    if (model && videoRef.current && videoRef.current.readyState === 4) {
      try {
        const predictions = await model.detect(videoRef.current);
        setDetections(predictions as Detection[]);
      } catch (err) {
        console.error("Detection error:", err);
      }
    }
    
    if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(detect);
    }
  };

  useEffect(() => {
    if (model && isEnabled) {
      isRunningRef.current = true;
      detect();
    } else {
      isRunningRef.current = false;
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      isRunningRef.current = false;
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [model, isEnabled]);

  return { detections, isLoadingModel };
};