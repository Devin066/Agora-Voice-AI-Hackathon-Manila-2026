
import React, { useState, useEffect, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import SecurityAlertOverlay from '../components/SecurityAlertOverlay';
import {
  Phone,
  PhoneOff,
  Shield,
  Activity,
  User,
  AlertTriangle,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TranscriptSegment {
  text: string;
  timestamp: string;
  isUser: boolean; // Simple differentiation for UI, though backend might not distinguish yet
}

const CallProtectionDashboard: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [threats, setThreats] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState("Safe to proceed.");
  const [showOverlay, setShowOverlay] = useState(false);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSpokenKeyRef = useRef<string>('');

  const speak = (text: string) => {
    if (!voiceAlertsEnabled) return;
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Scroll to bottom of transcript
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('call_status', (data: { status: string }) => {
      if (data.status === 'ended') {
        setIsCallActive(false);
        lastSpokenKeyRef.current = '';
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        // Keep final state visible
      } else if (data.status === 'connected') {
        setIsCallActive(true);
        // Reset state for new call
        setTranscripts([]);
        setRiskScore(0);
        setThreats([]);
        setRecommendation("Monitoring call...");
        setShowOverlay(false);
        lastSpokenKeyRef.current = '';
      }
    });

    socket.on('transcript_update', (data: { text: string, timestamp: string, isUser?: boolean }) => {
      setTranscripts((prev) => [
        ...prev,
        { text: data.text, timestamp: data.timestamp, isUser: data.isUser ?? false },
      ]);
    });

    socket.on('risk_update', (data: { riskScore: number, threats: string[], recommendation: string }) => {
      setRiskScore(data.riskScore);
      setThreats(data.threats);
      setRecommendation(data.recommendation);
      
      // Auto-trigger overlay on high risk
      if (data.riskScore > 50) {
        setShowOverlay(true);
      }

      const level = data.riskScore > 80 ? 'high' : data.riskScore > 50 ? 'medium' : 'low';
      if (level !== 'low') {
        const spokenKey = `${level}:${Math.round(data.riskScore)}:${data.threats.join('|')}:${data.recommendation}`;
        if (spokenKey !== lastSpokenKeyRef.current) {
          lastSpokenKeyRef.current = spokenKey;

          const headline = level === 'high'
            ? 'High risk scam warning.'
            : 'Warning. Potential scam detected.';
          const threatText = data.threats.length > 0 ? `Detected: ${data.threats.join(', ')}.` : '';
          speak(`${headline} Risk score ${Math.round(data.riskScore)}. ${threatText} ${data.recommendation}`.trim());
        }
      }
    });

    return () => {
      socket.off('connect');
      socket.off('call_status');
      socket.off('transcript_update');
      socket.off('risk_update');
    };
  }, []);

  const handleStartCall = () => {
    connectSocket();
    socket.emit('start_call', { callerNumber: '+15550199', userId: 'user_123' });
  };

  const handleEndCall = () => {
    socket.emit('end_call');
    disconnectSocket();
    setIsCallActive(false);
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">SentiCall <span className="text-blue-600">Protection</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${isCallActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isCallActive ? 'Monitoring Active' : 'System Idle'}</span>
            </div>
            <User className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Panel: Controls & Status */}
        <div className="md:col-span-1 space-y-6">
          {/* Call Control Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Call Simulator</h2>
              <button
                type="button"
                onClick={() => setVoiceAlertsEnabled((v) => !v)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                aria-label={voiceAlertsEnabled ? 'Disable voice alerts' : 'Enable voice alerts'}
              >
                {voiceAlertsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
            {!isCallActive ? (
              <button
                onClick={handleStartCall}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
              >
                <Phone className="w-5 h-5" />
                <span>Simulate Incoming Call</span>
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md animate-pulse"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            )}
              <p className="mt-4 text-xs text-gray-500 text-center">
                Plays a scripted conversation to demonstrate detection.
              </p>
          </div>

          {/* Risk Meter Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Live Risk Analysis</h2>
              <Activity className={`w-5 h-5 ${riskScore > 50 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                    riskScore > 80 ? 'text-red-600 bg-red-200' : 
                    riskScore > 50 ? 'text-yellow-600 bg-yellow-200' : 
                    'text-green-600 bg-green-200'
                  }`}>
                    {riskScore > 80 ? 'CRITICAL' : riskScore > 50 ? 'WARNING' : 'SAFE'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    {riskScore}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div style={{ width: `${riskScore}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                    riskScore > 80 ? 'bg-red-500' : 
                    riskScore > 50 ? 'bg-yellow-500' : 
                    'bg-green-500'
                }`}></div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
               {threats.length > 0 ? (
                 threats.map((threat, idx) => (
                   <div key={idx} className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md">
                     <AlertTriangle className="w-4 h-4" />
                     <span>{threat}</span>
                   </div>
                 ))
               ) : (
                 <div className="text-sm text-gray-400 italic">No threats detected yet.</div>
               )}
            </div>
          </div>
        </div>

        {/* Right Panel: Live Transcript */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Live Transcript</h2>
            <span className="text-xs font-mono text-gray-400">SESSION-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {transcripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Activity className="w-12 h-12 opacity-20" />
                <p>Waiting for audio stream...</p>
              </div>
            ) : (
              transcripts.map((segment, idx) => (
                <div key={idx} className={`flex ${segment.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    segment.isUser 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                    <p className={`text-[10px] mt-1 ${segment.isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(segment.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <span>AI Analysis Active: Processing audio chunks...</span>
            </div>
          </div>
        </div>
      </main>

      {/* Overlay Component */}
      <SecurityAlertOverlay
        isVisible={showOverlay}
        riskScore={riskScore}
        threats={threats}
        recommendation={recommendation}
        onDismiss={() => setShowOverlay(false)}
      />
    </div>
  );
};

export default CallProtectionDashboard;
