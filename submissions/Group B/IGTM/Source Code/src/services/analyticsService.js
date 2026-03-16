import { average, formatDuration } from '../utils/helpers'

class AnalyticsService {
  buildMetrics({ scenarioId, messages, startTime, endTime }) {
    const userMessages = messages.filter((message) => message.role === 'user')
    const assistantMessages = messages.filter((message) => message.role === 'assistant')
    const userLengths = userMessages.map((message) => message.content.length)
    const avgUserLength = Math.round(average(userLengths))
    const duration = formatDuration(startTime, endTime)

    if (scenarioId === 'salary-negotiation') {
      const hasEvidence = userMessages.some((message) =>
        /(impact|market|data|delivered|results|scope|led)/i.test(message.content),
      )
      const confidence = Math.min(100, Math.max(50, avgUserLength / 2))
      const settlementQuality = Math.min(95, 55 + (hasEvidence ? 20 : 0) + Math.floor(userMessages.length * 2))
      return {
        duration,
        totalTurns: messages.length,
        score: Math.round((confidence + settlementQuality) / 2),
        highlights: [
          `Evidence usage: ${hasEvidence ? 'Strong' : 'Needs more proof points'}`,
          `Response pacing: ${userMessages.length >= 4 ? 'Steady' : 'Too short'}`,
          `Confidence estimate: ${confidence}/100`,
        ],
      }
    }

    const starSignals = userMessages.filter((message) =>
      /(situation|task|action|result|learned)/i.test(message.content),
    ).length
    const relevance = Math.min(100, 60 + starSignals * 8)
    const structure = Math.min(100, 55 + Math.floor(avgUserLength / 8))
    return {
      duration,
      totalTurns: messages.length,
      score: Math.round((relevance + structure) / 2),
      highlights: [
        `STAR coverage: ${starSignals > 1 ? 'Good' : 'Add clearer structure'}`,
        `Answer depth: ${avgUserLength > 120 ? 'Detailed' : 'Expand examples'}`,
        `Interviewer engagement: ${assistantMessages.length >= 3 ? 'Active follow-ups' : 'Limited'}`,
      ],
    }
  }
}

export default new AnalyticsService()
