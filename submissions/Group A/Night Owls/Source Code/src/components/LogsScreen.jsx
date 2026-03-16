import React from 'react';
import { Download, Terminal } from 'lucide-react';

export function LogsScreen({ logs, logsEndRef }) {
  const handleDownloadLogs = () => {
    const logText = logs.length > 0 ? logs.join('\n') : "No logs available. Start a session to generate logs.";
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'virtual-circle-logs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 h-full flex flex-col relative z-10">
      <div className="mt-8 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">Session Logs</h1>
          <p className="text-[13px] text-gray-500 font-semibold mt-1">Pipeline testing and debug view</p>
        </div>
        <button 
          onClick={handleDownloadLogs}
          className="mb-1 p-2 bg-gradient-to-b from-gray-800 to-gray-900 text-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-gray-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold px-3.5 py-2.5"
          title="Download Logs"
        >
          <Download size={14} /> Save
        </button>
      </div>
      
      <div className="flex-1 bg-[#1A1B26] rounded-[32px] p-6 overflow-y-auto font-mono text-[12px] leading-relaxed shadow-2xl border-[4px] border-white/40 flex flex-col relative">
        <div className="flex gap-2 mb-6 border-b border-gray-800/80 pb-4 sticky top-0 bg-[#1A1B26] z-10 pt-1">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm"></div>
        </div>

        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic text-center px-4 opacity-70">
            <Terminal size={40} className="mb-4 opacity-40 text-gray-400" />
            <p className="font-medium">Waiting for spatial session to begin...</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {logs.map((log, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300 flex items-start group">
                <span className="text-indigo-400 mr-3 opacity-80 mt-0.5 group-hover:translate-x-1 transition-transform">➜</span>
                <span className="text-[#A9DC76] font-medium tracking-wide">{log}</span>
              </div>
            ))}
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
