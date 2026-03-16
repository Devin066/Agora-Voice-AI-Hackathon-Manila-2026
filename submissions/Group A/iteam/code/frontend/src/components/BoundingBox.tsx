import type { Detection } from '../hooks/useObjectDetection';
import type { AlertLevel } from '../utils/contextBuilder';

interface BoundingBoxProps {
  detection: Detection;
  containerWidth: number;
  containerHeight: number;
  videoWidth: number;
  videoHeight: number;
  alertLevel?: AlertLevel;
}

export const BoundingBox = ({ 
  detection, 
  containerWidth, 
  containerHeight, 
  videoWidth, 
  videoHeight,
  alertLevel = 'safe',
}: BoundingBoxProps) => {
  const [x, y, width, height] = detection.bbox;
  
  // Calculate scaling
  const scaleX = containerWidth / videoWidth;
  const scaleY = containerHeight / videoHeight;

  // Since video is mirrored (transform: scale-x-[-1]), we need to mirror the coordinates.
  // Original X is from left. Mirrored X is from right.
  // So: mirroredX = videoWidth - x - width
  const mirroredX = videoWidth - x - width;

  const boxClass = `bounding-box ${alertLevel}`;
  const labelClass = `bounding-box-label ${alertLevel}`;

  return (
    <div
      className={boxClass}
      style={{
        left: mirroredX * scaleX,
        top: y * scaleY,
        width: width * scaleX,
        height: height * scaleY,
      }}
    >
      <div className={labelClass}>
        {detection.class} {Math.round(detection.score * 100)}%
      </div>
    </div>
  );
};