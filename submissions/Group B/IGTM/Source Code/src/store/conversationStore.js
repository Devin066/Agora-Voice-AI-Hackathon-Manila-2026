import { create } from 'zustand'

const initialNegotiationState = {
  currentOffer: 80000,
  maxOffer: 92000,
  minOffer: 75000,
  userLastAsk: null,
  dealClosed: false,
  closureReason: null,
}

const initialInterviewState = {
  questionIndex: 0,
  questionsAsked: [],
  userResponses: [],
  followUpMode: false,
}

const initialBrainProfile = {
  resumeText: '',
  jobDescriptionText: '',
  interviewFocus: '',
  customQuestions: '',
  analysisSummary: '',
  generatedInterviewQuestions: [],
  generatedNegotiationQuestions: [],
}

const useConversationStore = create((set) => ({
  currentScenario: null,
  availableScenarios: ['salary-negotiation', 'job-interview', 'performance-review'],
  conversationActive: false,
  conversationId: null,
  messages: [],
  turnCount: 0,
  negotiationState: initialNegotiationState,
  interviewState: initialInterviewState,
  isSpeaking: false,
  isListening: false,
  audioLevel: 0,
  conversationStartTime: null,
  conversationEndTime: null,
  analyticsData: null,
  brainProfile: initialBrainProfile,
  setScenario: (scenario) => set({ currentScenario: scenario }),
  setBrainProfile: (updates) =>
    set((state) => ({
      brainProfile: { ...state.brainProfile, ...updates },
    })),
  startConversation: () =>
    set({
      conversationActive: true,
      conversationId: Date.now().toString(),
      messages: [],
      turnCount: 0,
      conversationStartTime: Date.now(),
      conversationEndTime: null,
      analyticsData: null,
    }),
  endConversation: () =>
    set({
      conversationActive: false,
      conversationEndTime: Date.now(),
      isListening: false,
      isSpeaking: false,
    }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          timestamp: Date.now(),
          turnNumber: state.turnCount,
        },
      ],
      turnCount: state.turnCount + 1,
    })),
  updateNegotiationState: (updates) =>
    set((state) => ({
      negotiationState: { ...state.negotiationState, ...updates },
    })),
  updateInterviewState: (updates) =>
    set((state) => ({
      interviewState: { ...state.interviewState, ...updates },
    })),
  setAudioState: (updates) => set((state) => ({ ...state, ...updates })),
  setAnalytics: (data) => set({ analyticsData: data }),
  resetConversation: () =>
    set((state) => ({
      conversationActive: false,
      conversationId: null,
      messages: [],
      turnCount: 0,
      negotiationState: initialNegotiationState,
      interviewState: initialInterviewState,
      isSpeaking: false,
      isListening: false,
      audioLevel: 0,
      conversationStartTime: null,
      conversationEndTime: null,
      analyticsData: null,
      brainProfile: state.brainProfile,
    })),
}))

export default useConversationStore
