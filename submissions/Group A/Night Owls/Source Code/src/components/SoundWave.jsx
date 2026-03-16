import React from 'react';

export function SoundWave({ color }) {
  return (
    <div className="flex items-end gap-[2px] h-4 mx-1">
      <div className="w-[3px] bg-current rounded-full eq-bar shadow-sm" style={{ color, backgroundColor: color }} />
      <div className="w-[3px] bg-current rounded-full eq-bar shadow-sm" style={{ color, backgroundColor: color }} />
      <div className="w-[3px] bg-current rounded-full eq-bar shadow-sm" style={{ color, backgroundColor: color }} />
      <div className="w-[3px] bg-current rounded-full eq-bar shadow-sm" style={{ color, backgroundColor: color }} />
    </div>
  );
}
