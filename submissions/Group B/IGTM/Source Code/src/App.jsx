import { useEffect, useMemo, useState } from 'react'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ConversationInterface from './components/ConversationInterface'
import ScenarioSelector from './components/ScenarioSelector'
import StatusIndicator from './components/StatusIndicator'
import VoiceVisualizer from './components/VoiceVisualizer'
import analyticsService from './services/analyticsService'
import agoraAgentService from './services/agoraAgentService'
import conversationEngine from './services/conversationEngine'
import fileIngestionService from './services/fileIngestionService'
import speechService from './services/speechService'
import useConversationStore from './store/conversationStore'
import { CONVERSATION_CONFIG, SCENARIOS } from './utils/constants'
import { sleep } from './utils/helpers'

function App() {
  const {
    currentScenario,
    setScenario,
    conversationActive,
    startConversation,
    endConversation,
    resetConversation,
    messages,
    turnCount,
    addMessage,
    updateNegotiationState,
    updateInterviewState,
    setAudioState,
    isListening,
    isSpeaking,
    audioLevel,
    conversationStartTime,
    conversationEndTime,
    analyticsData,
    setAnalytics,
    brainProfile,
    setBrainProfile,
  } = useConversationStore()
  const [input, setInput] = useState('')
  const [interimText, setInterimText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadingField, setUploadingField] = useState('')
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' })
  const [resumeFileName, setResumeFileName] = useState('')
  const [jobFileName, setJobFileName] = useState('')
  const [brainAnalyzing, setBrainAnalyzing] = useState(false)
  const [agoraSession, setAgoraSession] = useState(null)

  const scenarioLabel = useMemo(
    () => Object.values(SCENARIOS).find((item) => item.id === currentScenario)?.name || 'None selected',
    [currentScenario],
  )
  const voiceRuntime = (import.meta.env.VITE_VOICE_RUNTIME || 'native').toLowerCase()
  const usingAgora = agoraAgentService.isAgoraMode()
  const agoraConfigured = agoraAgentService.isConfigured()
  const activeBrainQuestions = useMemo(() => {
    if (currentScenario === 'salary-negotiation') {
      return brainProfile.generatedNegotiationQuestions || []
    }
    if (currentScenario === 'job-interview') {
      return brainProfile.generatedInterviewQuestions || []
    }
    return []
  }, [currentScenario, brainProfile.generatedInterviewQuestions, brainProfile.generatedNegotiationQuestions])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isListening) {
        setAudioState({ audioLevel: Math.floor(Math.random() * 80) + 20 })
      } else {
        setAudioState({ audioLevel: 0 })
      }
    }, 180)
    return () => window.clearInterval(interval)
  }, [isListening, setAudioState])

  const addAssistantMessage = async (text) => {
    addMessage({ role: 'assistant', content: text })
    setAudioState({ isSpeaking: true })
    await speechService.speak(text, conversationEngine.getVoiceId(currentScenario))
    setAudioState({ isSpeaking: false })
  }

  const runAssistantTurn = async () => {
    setThinking(true)
    try {
      await sleep(CONVERSATION_CONFIG.THINKING_DELAY_MS)
      const assistantText = await conversationEngine.generateAssistantMessage({
        scenarioId: currentScenario,
        messages: useConversationStore.getState().messages,
        negotiationState: useConversationStore.getState().negotiationState,
        interviewState: useConversationStore.getState().interviewState,
        turnCount: useConversationStore.getState().turnCount,
        brainProfile: useConversationStore.getState().brainProfile,
      })
      await addAssistantMessage(assistantText)
    } catch (error) {
      const state = useConversationStore.getState()
      const fallbackText = conversationEngine.generateFallback(
        currentScenario,
        state.negotiationState,
        state.interviewState,
      )
      await addAssistantMessage(fallbackText)
      setErrorMessage(error.message || 'AI Brain unavailable. Start backend and try again.')
    } finally {
      setThinking(false)
    }
  }

  const beginConversation = async () => {
    if (!currentScenario) {
      setErrorMessage('Choose a scenario first.')
      return
    }
    if (!brainProfile.resumeText.trim() || !brainProfile.jobDescriptionText.trim()) {
      setErrorMessage('Upload both resume and job description before starting.')
      return
    }
    if (!activeBrainQuestions.length) {
      const success = await runBrainAnalysis(brainProfile)
      if (!success) return
    }
    if (usingAgora && !agoraConfigured) {
      setErrorMessage('Agora mode is enabled but missing configuration. Set VITE_AGORA_APP_ID and VITE_AGORA_SAMPLE_BACKEND_URL.')
      return
    }
    setErrorMessage('')
    if (usingAgora) {
      try {
        const session = await agoraAgentService.startAgentSession({
          scenarioId: currentScenario,
          profileContext: {
            resumeText: brainProfile.resumeText,
            jobDescriptionText: brainProfile.jobDescriptionText,
            interviewFocus: brainProfile.interviewFocus,
            customQuestions: activeBrainQuestions.join('\n'),
          },
        })
        setAgoraSession(session)
      } catch (error) {
        setErrorMessage(error.message || 'Could not start Agora agent session.')
        return
      }
    }
    startConversation()
    const opening = conversationEngine.getScenarioOpening(currentScenario, useConversationStore.getState().brainProfile)
    await addAssistantMessage(opening)
  }

  const handleSend = async (rawText = input) => {
    const text = rawText.trim()
    if (!text || !conversationActive || thinking || isSpeaking) return
    setInput('')
    setInterimText('')
    addMessage({ role: 'user', content: text })
    const updates = conversationEngine.applyScenarioUpdates(
      currentScenario,
      text,
      useConversationStore.getState().negotiationState,
      useConversationStore.getState().interviewState,
    )
    if (updates.negotiationUpdates) {
      updateNegotiationState(updates.negotiationUpdates)
    }
    if (updates.interviewUpdates) {
      updateInterviewState(updates.interviewUpdates)
    }
    await runAssistantTurn()
  }

  const toggleListening = async () => {
    if (!conversationActive) return
    if (isListening) {
      speechService.stopListening()
      setAudioState({ isListening: false })
      setInterimText('')
      return
    }
    try {
      setErrorMessage('')
      await speechService.startListening(
        async (finalTranscript) => {
          await handleSend(finalTranscript)
        },
        (partialTranscript) => setInterimText(partialTranscript),
      )
      setAudioState({ isListening: true })
    } catch {
      setErrorMessage('Microphone unavailable. You can continue in typed mode.')
    }
  }

  const handleEndConversation = () => {
    speechService.stopListening()
    speechService.cancelSpeech()
    if (usingAgora) {
      agoraAgentService.endAgentSession()
      setAgoraSession(null)
    }
    endConversation()
    const state = useConversationStore.getState()
    const baseMetrics = analyticsService.buildMetrics({
      scenarioId: state.currentScenario,
      messages: state.messages,
      startTime: state.conversationStartTime,
      endTime: Date.now(),
    })
    setAnalytics(baseMetrics)
    conversationEngine
      .generateSessionFeedback({
        scenarioId: state.currentScenario,
        messages: state.messages,
        brainProfile: state.brainProfile,
      })
      .then((feedback) => {
        setAnalytics({
          ...baseMetrics,
          score: feedback.score || baseMetrics.score,
          feedbackSummary: feedback.summary,
          strengths: feedback.strengths || [],
          tips: feedback.tips || [],
          keynotes: feedback.keynotes || [],
        })
      })
      .catch(() => {
        setAnalytics({
          ...baseMetrics,
          feedbackSummary: 'Session completed. Keep practicing with clearer examples and stronger measurable outcomes.',
          strengths: ['Stayed engaged in the scenario', 'Completed a full practice session'],
          tips: ['Use STAR structure consistently', 'Add metrics to each example'],
          keynotes: ['Brain fallback feedback was used for this session'],
        })
      })
  }

  const handleReset = () => {
    speechService.stopListening()
    speechService.cancelSpeech()
    setInput('')
    setInterimText('')
    setErrorMessage('')
    setUploadMessage({ type: '', text: '' })
    setResumeFileName('')
    setJobFileName('')
    setAgoraSession(null)
    setThinking(false)
    if (usingAgora) {
      agoraAgentService.endAgentSession()
    }
    resetConversation()
  }

  const runBrainAnalysis = async (nextBrainProfile) => {
    if (!nextBrainProfile.resumeText.trim() || !nextBrainProfile.jobDescriptionText.trim()) return
    setBrainAnalyzing(true)
    setUploadMessage({ type: 'info', text: 'AI Brain is reading your files and generating scenario questions...' })
    try {
      const result = await conversationEngine.analyzeBrainProfile(nextBrainProfile)
      setBrainProfile({
        analysisSummary: result.summary,
        generatedInterviewQuestions: result.interviewQuestions,
        generatedNegotiationQuestions: result.negotiationQuestions,
      })
      setUploadMessage({
        type: 'success',
        text: `AI Brain generated ${result.interviewQuestions.length} interview and ${result.negotiationQuestions.length} negotiation questions.`,
      })
      return true
    } catch (error) {
      const fallback = conversationEngine.fallbackBrainAnalysis(nextBrainProfile)
      setBrainProfile({
        analysisSummary: fallback.summary,
        generatedInterviewQuestions: fallback.interviewQuestions,
        generatedNegotiationQuestions: fallback.negotiationQuestions,
      })
      setUploadMessage({
        type: 'info',
        text: `AI Brain fallback generated ${fallback.interviewQuestions.length} interview and ${fallback.negotiationQuestions.length} negotiation questions.`,
      })
      setErrorMessage(error.message || 'AI Brain analysis failed. Using fallback mode.')
      return true
    } finally {
      setBrainAnalyzing(false)
    }
  }

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return
    try {
      setUploadMessage({ type: '', text: '' })
      setUploadingField(fieldName)
      const parsedText = await fileIngestionService.parse(file)
      const currentBrainProfile = useConversationStore.getState().brainProfile
      const nextBrainProfile = {
        ...currentBrainProfile,
        [fieldName]: parsedText,
      }
      setBrainProfile({
        [fieldName]: parsedText,
        analysisSummary: '',
        generatedInterviewQuestions: [],
        generatedNegotiationQuestions: [],
      })
      if (fieldName === 'resumeText') {
        setResumeFileName(file.name)
      } else {
        setJobFileName(file.name)
      }
      setUploadMessage({ type: 'success', text: `${file.name} loaded successfully.` })
      await runBrainAnalysis(nextBrainProfile)
    } catch (error) {
      setUploadMessage({ type: 'error', text: error.message || 'Could not read file.' })
    } finally {
      setUploadingField('')
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
      <div className="rounded-2xl border border-white/15 bg-black/25 p-5 md:p-7">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">AI Conversation Arena</h1>
            <p className="text-sm text-slate-300">High-stakes voice practice for career conversations</p>
          </div>
          <StatusIndicator
            active={conversationActive}
            listening={isListening}
            speaking={isSpeaking}
            thinking={thinking}
            mode={conversationActive ? scenarioLabel : 'Pre-session'}
          />
        </header>

        <ScenarioSelector currentScenario={currentScenario} onSelect={setScenario} />

        <div className="mt-5 rounded-xl border border-white/20 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">AI Brain Context</p>
          <p className="mt-1 text-xs text-slate-300">
            Upload your resume and job description. AI Brain will tailor both scenario flows.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={(event) => {
                  handleFileUpload('resumeText', event.target.files?.[0])
                  event.target.value = ''
                }}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:text-white"
              />
              <p className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300">
                {resumeFileName
                  ? `Resume loaded: ${resumeFileName} (${brainProfile.resumeText.length} chars)`
                  : 'Resume file not uploaded'}
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={(event) => {
                  handleFileUpload('jobDescriptionText', event.target.files?.[0])
                  event.target.value = ''
                }}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:text-white"
              />
              <p className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300">
                {jobFileName
                  ? `Job description loaded: ${jobFileName} (${brainProfile.jobDescriptionText.length} chars)`
                  : 'Job description file not uploaded'}
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">AI Brain Output</p>
            <p className="mt-2 text-sm text-slate-200">
              {brainProfile.analysisSummary || 'Upload both files to generate tailored interview strategy and questions.'}
            </p>
            <ul className="mt-2 space-y-1">
              {activeBrainQuestions.map((question, index) => (
                <li key={`${question}-${index}`} className="text-sm text-slate-100">
                  {index + 1}. {question}
                </li>
              ))}
            </ul>
          </div>
          {uploadingField ? (
            <p className="mt-2 text-xs text-slate-300">
              Parsing {uploadingField === 'resumeText' ? 'resume' : 'job description'} file...
            </p>
          ) : null}
          {brainAnalyzing ? <p className="mt-2 text-xs text-slate-300">Generating interview plan...</p> : null}
          {uploadMessage.text ? (
            <p
              className={`mt-2 rounded px-2 py-1 text-xs ${
                uploadMessage.type === 'error'
                  ? 'bg-danger/30 text-red-100'
                  : uploadMessage.type === 'success'
                    ? 'bg-success/30 text-emerald-100'
                    : 'bg-white/10 text-slate-200'
              }`}
            >
              {uploadMessage.text}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {!conversationActive ? (
                <button
                  type="button"
                  onClick={beginConversation}
                  disabled={!currentScenario}
                  className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Start Session
                </button>
              ) : null}
              {conversationActive ? (
                <button
                  type="button"
                  onClick={handleEndConversation}
                  className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white"
                >
                  End Session
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                Reset
              </button>
              <span className="text-xs text-slate-300">Turns: {turnCount}</span>
              {conversationEndTime ? <span className="text-xs text-slate-300">Completed</span> : null}
            </div>

            {errorMessage ? (
              <p className="rounded-lg border border-danger/50 bg-danger/20 px-3 py-2 text-sm text-red-100">
                {errorMessage}
              </p>
            ) : null}

            <ConversationInterface
              messages={messages}
              interimText={interimText}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              onToggleListening={toggleListening}
              onEndConversation={handleEndConversation}
              listening={isListening}
              disabled={!conversationActive}
            />
          </div>

          <div className="space-y-4">
            <VoiceVisualizer active={isListening || isSpeaking} level={audioLevel} />
            <div className="rounded-xl border border-white/20 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Session Mode</p>
              <p className="mt-2 text-sm text-slate-300">
                {voiceRuntime === 'agora'
                  ? 'Voice runtime is set to Agora mode. Ensure your Agora backend and channel orchestration are running.'
                  : 'Voice input uses browser speech recognition. Speech output uses ElevenLabs with browser fallback.'}
              </p>
              {voiceRuntime === 'agora' ? (
                <p className="mt-2 text-xs text-slate-300">
                  {agoraConfigured
                    ? agoraSession
                      ? `Agora channel active: ${agoraSession.channelName}`
                      : 'Agora configuration detected. Session channel will start when you start the interview.'
                    : 'Agora env missing. Configure VITE_AGORA_APP_ID and VITE_AGORA_SAMPLE_BACKEND_URL.'}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <AnalyticsDashboard analyticsData={analyticsData} />
          {conversationStartTime && !conversationEndTime && !analyticsData ? (
            <p className="mt-3 text-xs text-slate-400">Analytics appear when you end the session.</p>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default App
