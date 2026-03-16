'use client';

import { useState } from 'react';
import { MessageCircle, AudioLines } from 'lucide-react';

const TRACK_WIDTH = 72;   // w-18 — balanced width (not too wide, not too tight)
const TRACK_HEIGHT = 38; // taller than thumb so there's vertical breathing room
const THUMB_SIZE = 28;   // w-7 h-7 (fits inside track)
const PADDING = 6;       // equal horizontal padding so circle and icons sit balanced
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2; // 32px

// Fixed icon positions: left and right (thumb slides over them)
const LEFT_ICON_CENTER = PADDING + THUMB_SIZE / 2;
const RIGHT_ICON_CENTER = PADDING + THUMB_TRAVEL + THUMB_SIZE / 2;

type ToggleSwitchProps = {
  /** true = voice (AudioLines), false = chat (MessageCircle) */
  value?: boolean;
  onChange?: (value: boolean) => void;
};

const ToggleSwitch = ({ value, onChange }: ToggleSwitchProps) => {
  const [internal, setInternal] = useState(false);
  const isControlled = value !== undefined;
  const isToggled = isControlled ? value : internal;
  const setToggled = isControlled ? (onChange ?? (() => {})) : setInternal;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isToggled}
      onClick={() => setToggled(!isToggled)}
      className="relative flex w-[72px] shrink-0 items-center justify-center bg-[#3A3E4A] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A3E4A]"
      style={{ height: TRACK_HEIGHT, borderRadius: THUMB_SIZE / 2 }}
    >
      {/* Sliding thumb — subtle shadow and border for raised look */}
      <div
        className="absolute left-[6px] top-1/2 z-0 h-7 w-7 rounded-full bg-white shadow-md ring-1 ring-gray-200/80 transition-transform duration-300 ease-in-out"
        style={{ transform: `translateY(-50%) translateX(${isToggled ? THUMB_TRAVEL : 0}px)` }}
      />
      {/* Icons fixed in place — only the thumb slides */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div
          className="absolute top-1/2 flex items-center justify-center text-gray-400"
          style={{ left: LEFT_ICON_CENTER, transform: 'translate(-50%, -50%)' }}
        >
          <MessageCircle size={18} strokeWidth={2} aria-hidden className="shrink-0 block" />
        </div>
        <div
          className="absolute top-1/2 flex items-center justify-center text-gray-400"
          style={{ left: RIGHT_ICON_CENTER, transform: 'translate(-50%, -50%)' }}
        >
          <AudioLines size={18} strokeWidth={2} aria-hidden className="shrink-0 block" />
        </div>
      </div>
    </button>
  );
};

export default ToggleSwitch;
