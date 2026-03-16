import type { Detection } from '../hooks/useObjectDetection';

export type AlertLevel = 'safe' | 'notice' | 'caution' | 'stop';

export const MUST_DETECT_CLASSES = [
  'person',
  'chair',
  'bench',
  'couch',
  'dining table',
  'table',
  'bottle',
  'backpack',
  'handbag',
  'suitcase',
  'potted plant',
  'cup',
  'laptop',
  'book',
  'cell phone',
  'bicycle',
  'motorcycle',
  'car',
  'truck',
] as const;

const OBSTACLE_CLASSES = new Set([
  'person',
  'chair',
  'bench',
  'couch',
  'potted plant',
  'dining table',
  'table',
  'tv',
  'suitcase',
  'backpack',
  'handbag',
  'bottle',
  'cup',
  'book',
  'laptop',
  'cell phone',
  'motorcycle',
  'bicycle',
  'car',
  'truck',
]);

const normalizeClassName = (value: string) => value.toLowerCase().trim();

const getAreaRatio = (detection: Detection, videoWidth: number, videoHeight: number) => {
  const [, , width, height] = detection.bbox;
  return (width * height) / (videoWidth * videoHeight);
};

const getDirectionLabel = (detection: Detection, videoWidth: number) => {
  const [x, , width] = detection.bbox;
  const centerX = x + width / 2;
  const normalized = centerX / videoWidth;

  if (normalized < 0.33) return 'left';
  if (normalized > 0.67) return 'right';
  return 'front';
};

const formatDirection = (direction: string) =>
  direction === 'front' ? 'in front of you' : `on your ${direction}`;

const getHazardScore = (detection: Detection, videoWidth: number, videoHeight: number) => {
  const [x, y, width, height] = detection.bbox;
  const frameArea = videoWidth * videoHeight;
  const boxAreaRatio = (width * height) / frameArea;

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const horizontalOffset = Math.abs(centerX / videoWidth - 0.5);
  const verticalBias = centerY / videoHeight;

  const centeredBonus = horizontalOffset < 0.18 ? 0.24 : horizontalOffset < 0.28 ? 0.14 : 0.04;
  const lowerFrameBonus = verticalBias > 0.62 ? 0.18 : verticalBias > 0.45 ? 0.08 : 0;
  const obstacleBonus = OBSTACLE_CLASSES.has(normalizeClassName(detection.class)) ? 0.18 : 0;
  const confidenceBonus = detection.score > 0.7 ? 0.05 : 0;

  return boxAreaRatio + centeredBonus + lowerFrameBonus + obstacleBonus + confidenceBonus;
};

const shouldKeepForAssistiveContext = (
  detection: Detection,
  videoWidth: number,
  videoHeight: number,
) => {
  const className = normalizeClassName(detection.class);
  const areaRatio = getAreaRatio(detection, videoWidth, videoHeight);
  const direction = getDirectionLabel(detection, videoWidth);

  if (!MUST_DETECT_CLASSES.includes(className as (typeof MUST_DETECT_CLASSES)[number])) {
    return false;
  }

  if (detection.score < 0.52) {
    return false;
  }

  // Reduce background crowd noise: only keep people who are reasonably near,
  // centered, or otherwise important to the immediate walking path.
  if (className === 'person') {
    if (areaRatio < 0.06 && direction !== 'front') {
      return false;
    }
    if (areaRatio < 0.045) {
      return false;
    }
  }

  if (className === 'chair' || className === 'bench' || className === 'couch') {
    return areaRatio >= 0.025 || direction === 'front';
  }

  if (className === 'bottle' || className === 'cup' || className === 'cell phone' || className === 'book') {
    return areaRatio >= 0.045 || getHazardScore(detection, videoWidth, videoHeight) >= 0.34;
  }

  return areaRatio >= 0.02 || getHazardScore(detection, videoWidth, videoHeight) >= 0.28;
};

export const filterDetectionsForAssistiveContext = (
  detections: Detection[],
  videoWidth: number,
  videoHeight: number,
) => detections.filter((detection) => shouldKeepForAssistiveContext(detection, videoWidth, videoHeight));

export const getDetectionAlertLevel = (
  detection: Detection,
  videoWidth: number,
  videoHeight: number,
): AlertLevel => {
  const score = getHazardScore(detection, videoWidth, videoHeight);

  if (score >= 0.58) return 'stop';
  if (score >= 0.42) return 'caution';
  if (score >= 0.28) return 'notice';
  return 'safe';
};

export const isHazardDetection = (detection: Detection, videoWidth: number, videoHeight: number) =>
  getDetectionAlertLevel(detection, videoWidth, videoHeight) !== 'safe';

export const getSceneAlertLevel = (
  detections: Detection[],
  videoWidth: number,
  videoHeight: number,
): AlertLevel => {
  const relevantDetections = filterDetectionsForAssistiveContext(detections, videoWidth, videoHeight);
  const levels = relevantDetections.map((detection) => getDetectionAlertLevel(detection, videoWidth, videoHeight));

  if (levels.includes('stop')) return 'stop';
  if (levels.includes('caution')) return 'caution';
  if (levels.includes('notice')) return 'notice';
  return 'safe';
};

const buildDetectionPhrase = (
  detection: Detection,
  direction: string,
  level: AlertLevel,
) => {
  const name = detection.class;
  const location = formatDirection(direction);

  if (level === 'stop') {
    return direction === 'front'
      ? `${name} is immediately in front of you`
      : `${name} is dangerously close on your ${direction}`;
  }

  if (level === 'caution') {
    return direction === 'front'
      ? `${name} is directly in front of you`
      : `${name} is close on your ${direction}`;
  }

  return `${name} is ${location}`;
};

export const buildContext = (detections: Detection[], videoWidth: number, videoHeight: number): string => {
  const relevantDetections = filterDetectionsForAssistiveContext(detections, videoWidth, videoHeight);
  if (relevantDetections.length === 0) {
    return 'I do not have a confident obstacle reading yet. Ask again in a moment or point the camera more clearly ahead.';
  }

  const rankedDetections = relevantDetections
    .map((detection) => ({
      detection,
      score: getHazardScore(detection, videoWidth, videoHeight),
      level: getDetectionAlertLevel(detection, videoWidth, videoHeight),
      direction: getDirectionLabel(detection, videoWidth),
    }))
    .sort((a, b) => b.score - a.score);

  const primary = rankedDetections[0];
  const secondarySummaries = rankedDetections
    .slice(1)
    .filter((item, index, items) =>
      items.findIndex((candidate) =>
        candidate.detection.class === item.detection.class && candidate.direction === item.direction) === index)
    .slice(0, 2)
    .map((item) => buildDetectionPhrase(item.detection, item.direction, item.level));

  const primarySummary = buildDetectionPhrase(primary.detection, primary.direction, primary.level);

  if (primary.level === 'stop') {
    return secondarySummaries.length > 0
      ? `Stop. ${primarySummary}. Also, ${secondarySummaries.join('. ')}.`
      : `Stop. ${primarySummary}.`;
  }

  if (primary.level === 'caution') {
    return secondarySummaries.length > 0
      ? `Caution. ${primarySummary}. Also, ${secondarySummaries.join('. ')}.`
      : `Caution. ${primarySummary}.`;
  }

  if (secondarySummaries.length > 0) {
    return `${primarySummary}. Also, ${secondarySummaries.join('. ')}.`;
  }

  return `${primarySummary}.`;
};