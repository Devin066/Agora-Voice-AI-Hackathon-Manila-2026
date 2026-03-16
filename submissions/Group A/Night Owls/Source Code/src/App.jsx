import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Activity, Terminal, Settings } from 'lucide-react';
import { COLORS, DEMO_TRANSCRIPT, AGORA_CONFIG } from './constants';
import { MainScreen } from './components/MainScreen';
import { LogsScreen } from './components/LogsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { TalkButton } from './components/TalkButton';
import { NavButton } from './components/NavButton';

function App() {
  const [activeTab, setActiveTab] = useState('main');
  const [appState, setAppState] = useState('idle');
  const [activeSpeaker, setActiveSpeaker] = useState(null); 
  const [transcripts, setTranscripts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [statusFlags, setStatusFlags] = useState({
    agora: false,
    audioCaptured: false,
    stt: false,
    ai: false,
    tts: false,
    spatial: false
  });
  const [agoraError, setAgoraError] = useState(null);
  const [userVolume, setUserVolume] = useState(0);

  const client = useRef(null);
  const localAudioTrack = useRef(null);
  const logsEndRef = useRef(null);
  const transcriptsEndRef = useRef(null);
  const volumeInterval = useRef(null);
  const processingTimeout = useRef(null);

  useEffect(() => {
    initAgora();

    return () => {
      if (localAudioTrack.current) {
        localAudioTrack.current.close();
      }
      if (client.current) {
        client.current.leave();
      }
    };
  }, []);

  const initAgora = async () => {
    setAgoraError(null);
    setStatusFlags(prev => ({ ...prev, agora: false }));
    
    if (client.current) {
      try {
        await client.current.leave();
      } catch (e) {}
    }
    
    client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    try {
      addLog(`App started with Agora ID: ${AGORA_CONFIG.APP_ID.substring(0, 4)}...`);
      addLog(`Channel: ${AGORA_CONFIG.CHANNEL}`);
      addLog(`Agent IDs: Empath=${AGORA_CONFIG.AGENTS.empath}, Strategist=${AGORA_CONFIG.AGENTS.strategist}, Stoic=${AGORA_CONFIG.AGENTS.stoic}`);
      
      if (!AGORA_CONFIG.APP_ID) {
        const err = 'AGORA_APP_ID is missing in .env';
        addLog(`ERROR: ${err}`);
        setAgoraError(err);
        return;
      }

      // No need to set role for RTC mode; all users are broadcasters by default.
      
      addLog(`Attempting to join channel: ${AGORA_CONFIG.CHANNEL}`);
      const userUid = await client.current.join(AGORA_CONFIG.APP_ID, AGORA_CONFIG.CHANNEL, AGORA_CONFIG.TOKEN || null, null);
      addLog(`Successfully joined Agora channel with UID: ${userUid}`);
      setStatusFlags(prev => ({ ...prev, agora: true }));
      setAgoraError(null);

      client.current.on('user-published', async (user, mediaType) => {
        addLog(`User published: UID=${user.uid}, mediaType=${mediaType}`);
        await client.current.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          try {
            user.audioTrack.play();
            addLog(`Remote user ${user.uid} audio playing`);
            
            // If an AI starts speaking, clear the processing timeout
            if (processingTimeout.current) {
              clearTimeout(processingTimeout.current);
              processingTimeout.current = null;
            }
          } catch (err) {
            addLog(`Audio play error for user ${user.uid}: ${err.message}`);
          }

          // Check if this user is one of our agents and mark them as active speaker
          const agentId = String(user.uid);
          addLog(`Checking if user ${agentId} matches agents...`);
          if (agentId === String(AGORA_CONFIG.AGENTS.empath)) {
            setActiveSpeaker('empath');
            setAppState('speaking');
            addLog(`AI Empath matches! UID=${agentId}`);
            setTranscripts(prev => [...prev, { role: 'empath', text: '...' }]);
          } else if (agentId === String(AGORA_CONFIG.AGENTS.strategist)) {
            setActiveSpeaker('strategist');
            setAppState('speaking');
            addLog(`AI Strategist matches! UID=${agentId}`);
            setTranscripts(prev => [...prev, { role: 'strategist', text: '...' }]);
          } else if (agentId === String(AGORA_CONFIG.AGENTS.stoic)) {
            setActiveSpeaker('stoic');
            setAppState('speaking');
            addLog(`AI Stoic matches! UID=${agentId}`);
            setTranscripts(prev => [...prev, { role: 'stoic', text: '...' }]);
          } else {
            addLog(`User ${agentId} is not a recognized agent.`);
          }
        }
      });

      // Add handler for when user stops speaking (unpublishing)
      client.current.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          const agentId = String(user.uid);
          addLog(`User unpublished: UID=${agentId}`);
          
          // Check if it was an agent and reset UI
          if (Object.values(AGORA_CONFIG.AGENTS).some(val => String(val) === agentId)) {
            setActiveSpeaker(null);
            setAppState('idle');
            addLog(`AI agent ${agentId} stopped speaking.`);
          } else {
            // If it wasn't a known agent, but we were speaking, check if any agents are still active
            // If not, reset to idle just in case
            setAppState(prev => {
              if (prev === 'speaking') {
                addLog(`Remote user ${agentId} stopped, resetting state if no other agents active.`);
                return 'idle';
              }
              return prev;
            });
            setActiveSpeaker(null);
          }
        }
      });
    } catch (error) {
      const errMessage = error.message || String(error);
      addLog(`Agora join error: ${errMessage}`);
      setAgoraError(errMessage);
    }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const getDynamicBackground = () => {
    if (!activeSpeaker) {
      return { 
        background: `linear-gradient(-45deg, #F5F7FA, #E8EDF2, #e0e7ff, #f3e8ff)`,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      };
    }
    const color = COLORS[activeSpeaker];
    return { 
      background: `radial-gradient(circle at 50% 30%, ${color}44 0%, #F5F7FA 80%)`,
      transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  const handlePressStart = async () => {
    if (appState !== 'idle') return;
    if (!statusFlags.agora) {
      addLog('ERROR: Agora not connected. Please check your credentials and connection.');
      return;
    }
    setAppState('recording');
    setActiveSpeaker('user');
    addLog('Requesting microphone access...');
    setStatusFlags(prev => ({ ...prev, audioCaptured: true, stt: false, ai: false, tts: false, spatial: false }));
    setTranscripts([]);

    try {
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      addLog('Microphone access granted. Publishing audio...');
      await client.current.publish(localAudioTrack.current);
      addLog('Audio published to channel.');

      // Monitor volume levels
      volumeInterval.current = setInterval(() => {
        if (localAudioTrack.current) {
          const volume = localAudioTrack.current.getVolumeLevel();
          setUserVolume(Math.floor(volume * 100));
        }
      }, 100);

    } catch (error) {
      addLog(`Mic error: ${error.message}`);
      setAppState('idle');
      setActiveSpeaker(null);
    }
  };

  const handlePressEnd = async () => {
    // If we are not recording, we don't need to do anything.
    if (appState !== 'recording') return;

    // Always perform cleanup if a track exists, regardless of appState, to prevent a hot mic.
    setUserVolume(0);
    if (volumeInterval.current) {
      clearInterval(volumeInterval.current);
      volumeInterval.current = null;
    }

    if (localAudioTrack.current) {
      try {
        addLog('Unpublishing and closing local audio...');
        await client.current.unpublish(localAudioTrack.current);
        localAudioTrack.current.stop();
        localAudioTrack.current.close();
        localAudioTrack.current = null;
        addLog('Local audio track closed.');
      } catch (error) {
        addLog(`Error closing track: ${error.message}`);
      }
    }

    // Transition to 'processing' state.
    setAppState('processing');
    setActiveSpeaker(null);
    addLog('Speech processing (waiting for AI response)...');

    // Set a safety timeout to reset back to 'idle' if AI doesn't respond in 15s
    if (processingTimeout.current) clearTimeout(processingTimeout.current);
    processingTimeout.current = setTimeout(() => {
      setAppState(prev => {
        if (prev === 'processing') {
          addLog('No AI response received (timed out). Resetting to idle.');
          return 'idle';
        }
        return prev;
      });
      processingTimeout.current = null;
    }, 15000); // 15 seconds timeout
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4 font-sans text-gray-800 transition-colors duration-700 relative overflow-hidden">
      {activeSpeaker && (
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-1000 blur-[100px]"
          style={{ backgroundColor: COLORS[activeSpeaker] }}
        />
      )}

      <div 
        className="relative w-full overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-1000 z-10"
        style={{ 
          maxWidth: '390px', 
          height: '100%',
          maxHeight: '844px',
          minHeight: '700px',
          ...getDynamicBackground(),
          borderRadius: '44px',
          border: '8px solid #0f172a',
          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), 0 30px 60px rgba(0,0,0,0.6)'
        }}
      >
        <div className="flex-1 overflow-y-auto pb-20 no-scrollbar relative z-10">
          <div key={activeTab} className="animate-in fade-in zoom-in duration-500 h-full">
            {activeTab === 'main' && (
              <MainScreen 
                appState={appState} 
                activeSpeaker={activeSpeaker} 
                transcripts={transcripts}
                statusFlags={statusFlags}
                transcriptsEndRef={transcriptsEndRef}
              />
            )}
            {activeTab === 'logs' && <LogsScreen logs={logs} logsEndRef={logsEndRef} />}
            {activeTab === 'settings' && <SettingsScreen />}
          </div>
        </div>

        {activeTab === 'main' && (
          <div className="absolute bottom-28 left-0 right-0 flex justify-center px-4 z-20 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="pointer-events-auto">
              <TalkButton 
                        appState={appState} 
                        onPressStart={handlePressStart} 
                        onPressEnd={handlePressEnd} 
                        activeSpeaker={activeSpeaker}
                        userVolume={userVolume}
                        agoraConnected={statusFlags.agora}
                        agoraError={agoraError}
                        onRetry={initAgora}
                      />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 w-full h-[90px] bg-white/60 backdrop-blur-2xl border-t border-white/60 flex justify-around items-center px-6 pb-5 z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.04)] rounded-b-[36px]">
          <NavButton icon={<Activity />} label="Circle" active={activeTab === 'main'} onClick={() => setActiveTab('main')} color={COLORS.user} />
          <NavButton icon={<Terminal />} label="Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} color={COLORS.empath} />
          <NavButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} color={COLORS.strategist} />
        </div>
      </div>
    </div>
  );
}

export default App;
