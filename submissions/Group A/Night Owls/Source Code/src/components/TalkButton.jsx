import React from 'react';
import { Mic, CircleDashed, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { COLORS } from '../constants';
import { SoundWave } from './SoundWave';

export function TalkButton({ appState, onPressStart, onPressEnd, activeSpeaker, userVolume, agoraConnected, agoraError, onRetry }) {
  let btnClass = "w-[96px] h-[96px] rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition-all duration-300 relative z-10 overflow-hidden group ";
  let icon = <Mic size={40} color="white" className="drop-shadow-md" />;
  let label = "Hold to Talk";
  let labelColor = "text-gray-700";
  let backgroundStyle = 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)';

  if (agoraError) {
    backgroundStyle = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)';
    label = "Connection Failed";
    labelColor = "text-red-600";
    icon = <AlertCircle size={40} color="white" />;
    btnClass += "animate-shake";
  } else if (!agoraConnected && appState === 'idle') {
    backgroundStyle = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
    label = "Connecting...";
    labelColor = "text-gray-400";
    icon = <CircleDashed size={40} color="white" className="animate-spin opacity-50" />;
  } else if (appState === 'recording') {
    backgroundStyle = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
    btnClass += "scale-110 shadow-[0_20px_50px_rgba(239,68,68,0.6)]";
    icon = (
      <div className="relative flex items-center justify-center">
        <div className="w-8 h-8 rounded-[8px] bg-white animate-pulse shadow-sm z-10" />
        {/* Scanning beam effect */}
        <div className="absolute inset-[-100%] bg-gradient-to-t from-red-500/0 via-red-500/30 to-red-500/0 animate-[scan_1s_linear_infinite]" />
        {/* Volume ring indicator */}
        <div 
          className="absolute rounded-full border-4 border-white/30 transition-all duration-100"
          style={{ 
            width: `${80 + (userVolume * 1.5)}px`, 
            height: `${80 + (userVolume * 1.5)}px`,
            opacity: userVolume > 5 ? 0.8 : 0
          }}
        />
      </div>
    );
    label = "Release to send";
    labelColor = "text-red-500 font-extrabold";
  } else if (appState === 'processing') {
    backgroundStyle = 'linear-gradient(135deg, #9ca3af 0%, #4b5563 100%)';
    icon = <CircleDashed size={40} color="white" className="animate-spin" />;
    label = "Synthesizing...";
  } else if (appState === 'speaking') {
    const color = COLORS[activeSpeaker] || '#9ca3af';
    backgroundStyle = `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`;
    btnClass += `shadow-[0_20px_50px_${color}60]`;
    icon = <Volume2 size={40} color="white" className="animate-pulse drop-shadow-md" />;
    label = "AI is speaking";
    labelColor = "text-gray-900 font-bold";
  } else {
    btnClass += "hover:bg-gray-800 active:scale-95 border-[6px] border-white/20 backdrop-blur-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {appState === 'recording' && (
          <>
            <div className="absolute inset-[-24px] rounded-full border-[3px] border-red-400 animate-ping opacity-70 duration-1000" />
            <div className="absolute inset-[-48px] rounded-full border border-red-300 animate-ping opacity-40 duration-1000 delay-150" />
          </>
        )}
        <button 
          className={btnClass}
          style={{ background: backgroundStyle }}
          onMouseDown={agoraError ? null : onPressStart}
          onMouseUp={agoraError ? null : onPressEnd}
          onMouseLeave={() => !agoraError && appState === 'recording' && onPressEnd()}
          onTouchStart={agoraError ? null : onPressStart}
          onTouchEnd={agoraError ? null : onPressEnd}
          onClick={agoraError ? onRetry : null}
          disabled={appState === 'processing' || appState === 'speaking' || (!agoraConnected && !agoraError)}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          
          {appState === 'idle' && !agoraError && (
            <div className="absolute inset-0 -translate-x-[150%] skew-x-[30deg] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[hologram_1.5s_ease-in-out_infinite]" />
          )}

          <div className="relative z-10 transition-transform group-hover:scale-110">{icon}</div>
        </button>
      </div>
      <div className={`mt-6 text-[14px] tracking-wide ${labelColor} transition-all duration-300 bg-white/95 backdrop-blur-2xl px-6 py-2.5 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.08)] border border-white font-semibold flex items-center gap-2`}>
        {appState === 'speaking' && <SoundWave color={COLORS[activeSpeaker]} />}
        {label}
        {agoraError && (
          <button 
            onClick={onRetry}
            className="ml-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>
      {agoraError && (
        <p className="mt-3 text-[11px] text-red-500 font-medium max-w-[250px] text-center line-clamp-2">
          {agoraError}
        </p>
      )}
    </div>
  );
}
