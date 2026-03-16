import React from 'react';
import { Wifi, Cpu, Mic, CircleDashed } from 'lucide-react';
import { SpatialCircle } from './SpatialCircle';
import { StatusItem } from './StatusItem';
import { TranscriptCard } from './TranscriptCard';

export function MainScreen({ appState, activeSpeaker, transcripts, statusFlags, transcriptsEndRef }) {
  return (
    <div className="p-4 flex flex-col h-full relative">
      <div className="text-center mt-8 mb-4 z-10 animate-in fade-in slide-in-from-top-4 duration-700 delay-100 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40 shadow-sm mb-2">
          <Wifi size={14} className="text-emerald-500 animate-[breathe_2s_infinite]" />
          <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">Agora Active</span>
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 drop-shadow-sm flex items-center justify-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Virtual Circle
        </h1>
      </div>

      <div className="relative w-full aspect-square mt-2 mb-8 z-0 animate-in zoom-in fade-in duration-700 delay-200">
        <SpatialCircle activeSpeaker={activeSpeaker} appState={appState} />
      </div>

      <div className="flex-1 overflow-y-auto pb-44 no-scrollbar px-1 flex flex-col gap-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-white mb-2 transition-all duration-500 hover:shadow-[0_15px_50px_rgba(0,0,0,0.06)] group">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400 group-hover:rotate-180 transition-transform duration-700" /> System Pipeline
            </h3>
            <div className="flex gap-1">
               <div className={`w-1.5 h-1.5 rounded-full ${appState !== 'idle' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
            <StatusItem label="Agora Link" active={statusFlags.agora} />
            <StatusItem label="Audio Sync" active={statusFlags.audioCaptured} />
            <StatusItem label="Speech → Text" active={statusFlags.stt} />
            <StatusItem label="AI Synthesis" active={statusFlags.ai} />
            <StatusItem label="Voice Gen" active={statusFlags.tts} />
            <StatusItem label="Spatial Audio" active={statusFlags.spatial} />
          </div>
        </div>

        {transcripts.length === 0 && appState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-70 animate-in fade-in duration-1000 delay-500">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="w-20 h-20 bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/60 relative z-10">
                <Mic size={28} className="text-gray-400" />
              </div>
            </div>
            <p className="text-[15px] text-gray-600 font-bold tracking-tight">The circle is quiet.</p>
            <p className="text-[13px] text-gray-500 mt-2 text-center px-8 leading-relaxed font-medium">Hold the microphone below to share what's on your mind with the agents.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {appState === 'recording' && (
            <div className="flex items-center justify-center py-6 text-red-500 space-x-3 bg-red-50/50 backdrop-blur-md rounded-[28px] border-2 border-red-100/50 shadow-inner animate-in fade-in zoom-in duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/20 to-transparent -translate-x-full group-hover:animate-[hologram_2s_linear_infinite]" />
              <div className="relative">
                <Mic size={20} className="animate-pulse" />
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20" />
              </div>
              <span className="text-[13px] font-bold tracking-widest uppercase">Scanning Voice...</span>
            </div>
          )}
          {transcripts.map((msg, idx) => (
            <TranscriptCard key={idx} role={msg.role} text={msg.text} />
          ))}
          {appState === 'processing' && (
            <div className="flex items-center justify-center py-8 text-gray-600 space-x-4 bg-white/80 backdrop-blur-2xl rounded-[28px] border-[2px] border-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] mx-2 animate-in pop-in overflow-hidden relative group">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 animate-[gradientShift_2s_linear_infinite] bg-[length:200%_100%]" />
              <div className="relative flex items-center justify-center">
                 <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-[ping_1.5s_ease-in-out_infinite]" />
                 <CircleDashed className="animate-spin text-indigo-500 relative z-10" size={28} />
                 <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse blur-[2px] absolute" />
              </div>
              <span className="text-[15px] font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-[gradientShift_3s_linear_infinite] bg-[length:200%_100%] relative z-10">
                Synthesizing Cognitive Insights...
              </span>
            </div>
          )}
        </div>
        <div ref={transcriptsEndRef} className="h-8" />
      </div>
    </div>
  );
}
