import { CONVERSATION_CONFIG } from '../utils/constants'
import { extractSalaryNumber } from '../utils/helpers'
import { jobInterviewScenario } from '../scenarios/jobInterview'
import { salaryNegotiationScenario } from '../scenarios/salaryNegotiation'

const scenarioMap = {
  [salaryNegotiationScenario.id]: salaryNegotiationScenario,
  [jobInterviewScenario.id]: jobInterviewScenario,
}

class ConversationEngine {
  getScenario(scenarioId) {
    return scenarioMap[scenarioId] || null
  }

  getOpeningMessage(scenarioId) {
    const scenario = this.getScenario(scenarioId)
    return scenario?.opening || 'Welcome. Let’s begin.'
  }

  getVoiceId(scenarioId) {
    const scenario = this.getScenario(scenarioId)
    return scenario?.voiceId || salaryNegotiationScenario.voiceId
  }

  getApiBase() {
    return import.meta.env.VITE_AI_BRAIN_BASE_URL?.trim() || ''
  }

  async post(path, payload) {
    const base = this.getApiBase()
    const url = `${base}${path}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      let message = `Request failed: ${response.status}`
      try {
        const data = await response.json()
        if (data?.error) message = data.error
      } catch {
        message = `Request failed: ${response.status}`
      }
      throw new Error(message)
    }
    return response.json()
  }

  applyScenarioUpdates(scenarioId, userText, negotiationState, interviewState) {
    if (scenarioId === 'salary-negotiation') {
      const ask = extractSalaryNumber(userText)
      if (!ask) return { negotiationUpdates: {} }
      const boundedAsk = Math.min(ask, 150000)
      const counter = Math.max(
        negotiationState.minOffer,
        Math.min(negotiationState.maxOffer, Math.round((negotiationState.currentOffer + boundedAsk) / 2)),
      )
      const dealClosed = boundedAsk <= negotiationState.maxOffer && boundedAsk >= negotiationState.minOffer
      return {
        negotiationUpdates: {
          userLastAsk: boundedAsk,
          currentOffer: counter,
          dealClosed,
          closureReason: dealClosed ? 'range-overlap' : null,
        },
      }
    }

    if (scenarioId === 'job-interview') {
      return {
        interviewUpdates: {
          questionIndex: interviewState.questionIndex + 1,
          userResponses: [...interviewState.userResponses, userText],
          followUpMode: userText.length < 120,
        },
      }
    }

    return {}
  }

  buildContextLine(scenarioId, negotiationState, interviewState, turnCount) {
    if (scenarioId === 'salary-negotiation') {
      return `Current offer: ${negotiationState.currentOffer}. User ask: ${negotiationState.userLastAsk || 'none'}. Deal closed: ${negotiationState.dealClosed}.`
    }
    if (scenarioId === 'job-interview') {
      return `Questions asked: ${interviewState.questionIndex}. Follow-up mode: ${interviewState.followUpMode}.`
    }
    return `Turn count: ${turnCount}.`
  }

  buildBrainContext(scenarioId, brainProfile) {
    if (!brainProfile) return ''
    const resumeText = brainProfile.resumeText?.trim()
    const jobDescriptionText = brainProfile.jobDescriptionText?.trim()
    const interviewFocus = brainProfile.interviewFocus?.trim()
    const customQuestions = brainProfile.customQuestions?.trim()
    const analysisSummary = brainProfile.analysisSummary?.trim()
    const generatedQuestions =
      scenarioId === 'job-interview'
        ? brainProfile.generatedInterviewQuestions || []
        : brainProfile.generatedNegotiationQuestions || []
    if (!resumeText && !jobDescriptionText && !interviewFocus && !customQuestions) return ''

    if (scenarioId === 'job-interview') {
      return [
        'Candidate Profile:',
        resumeText || 'Not provided',
        'Target Role Description:',
        jobDescriptionText || 'Not provided',
        'Priority Areas:',
        interviewFocus || 'General behavioral interview',
        'Must-ask Questions:',
        customQuestions || 'None specified',
        'AI Brain Summary:',
        analysisSummary || 'Not generated yet',
        'AI Brain Candidate-specific Questions:',
        generatedQuestions.length ? generatedQuestions.join('\n') : 'Not generated yet',
        'Interview policy: tailor every question to candidate experience and target role. Ask concrete, role-relevant follow-ups.',
      ].join('\n')
    }

    if (scenarioId === 'salary-negotiation') {
      return [
        'Candidate Profile:',
        resumeText || 'Not provided',
        'Target Role Description:',
        jobDescriptionText || 'Not provided',
        'Negotiation focus:',
        interviewFocus || 'Compensation and scope alignment',
      ].join('\n')
    }

    return ''
  }

  async generateAssistantMessage({
    scenarioId,
    messages,
    negotiationState,
    interviewState,
    turnCount,
    brainProfile,
  }) {
    const scenario = this.getScenario(scenarioId)
    if (!scenario) return 'I could not load this scenario.'

    const data = await this.post('/api/brain/respond', {
      scenarioId,
      messages,
      negotiationState,
      interviewState,
      turnCount,
      brainProfile,
    })
    const text = data?.text?.trim()
    if (!text) {
      throw new Error('AI Brain returned an empty response')
    }
    return text
  }

  async generateSessionFeedback({ scenarioId, messages, brainProfile }) {
    const data = await this.post('/api/brain/feedback', {
      scenarioId,
      messages,
      brainProfile,
    })
    if (!data?.summary || !Array.isArray(data?.tips) || !Array.isArray(data?.keynotes)) {
      throw new Error('AI Brain feedback payload was incomplete')
    }
    return data
  }

  fallbackBrainAnalysis(brainProfile) {
    const jd = brainProfile.jobDescriptionText || ''
    const resume = brainProfile.resumeText || ''
    const focus = brainProfile.interviewFocus || ''
    const skillKeywords = ['leadership', 'ownership', 'system design', 'communication', 'execution', 'stakeholder']
      .filter((keyword) => new RegExp(keyword, 'i').test(jd + resume + focus))
      .slice(0, 4)
    const interviewQuestions = [
      'Tell me about a project from your resume that best matches this role and why.',
      'Walk me through a time you handled a difficult tradeoff under pressure.',
      'How have you collaborated with stakeholders to deliver measurable outcomes?',
      'What is one gap between your background and this role, and how will you close it quickly?',
    ]
    const negotiationQuestions = [
      'What compensation range are you targeting for this role and what is your reasoning?',
      'What measurable impact from your background most strongly supports a higher offer?',
      'How do your role scope and responsibilities compare to similar market positions?',
      'What tradeoffs are you willing to make between base, bonus, and growth opportunities?',
    ]
    if (skillKeywords.length) {
      interviewQuestions.unshift(`Describe a specific example where you demonstrated ${skillKeywords[0]}.`)
      negotiationQuestions.unshift(
        `How does your ${skillKeywords[0]} experience increase your expected compensation?`,
      )
    }
    return {
      summary:
        'Candidate and role documents were parsed. Focus on role-fit, impact evidence, communication, and compensation leverage.',
      interviewQuestions: interviewQuestions.slice(0, 6),
      negotiationQuestions: negotiationQuestions.slice(0, 6),
    }
  }

  async analyzeBrainProfile(brainProfile) {
    const data = await this.post('/api/brain/analyze', brainProfile)
    if (!data?.summary || !data?.interviewQuestions?.length || !data?.negotiationQuestions?.length) {
      throw new Error('AI Brain analysis payload was incomplete')
    }
    return data
  }

  getScenarioOpening(scenarioId, brainProfile) {
    const generatedQuestions =
      scenarioId === 'job-interview'
        ? brainProfile?.generatedInterviewQuestions || []
        : brainProfile?.generatedNegotiationQuestions || []
    if (generatedQuestions.length) {
      return `Great, I have reviewed your background and role context. Let's start with this: ${generatedQuestions[0]}`
    }
    return this.getOpeningMessage(scenarioId)
  }

  generateFallback(scenarioId, negotiationState, interviewState) {
    if (scenarioId === 'salary-negotiation') {
      if (negotiationState.dealClosed) {
        return `Given your request, I can approve ${negotiationState.currentOffer}. If you accept, we can finalize today.`
      }
      return `Thanks for sharing your ask. Based on budget, I can move to ${negotiationState.currentOffer}. Help me understand your impact to go higher.`
    }
    if (scenarioId === 'job-interview') {
      if (interviewState.followUpMode) {
        return 'Can you add more detail on your exact actions, the result, and what you learned?'
      }
      return 'Good context. How does that example map to the role requirements, and what measurable result did you drive?'
    }
    return 'Please continue.'
  }
}

export default new ConversationEngine()
