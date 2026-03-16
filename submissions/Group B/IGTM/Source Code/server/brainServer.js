import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import OpenAI from 'openai'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const app = express()
const port = Number(process.env.AI_BRAIN_PORT || 8787)
const brainProvider = (process.env.BRAIN_PROVIDER || 'openai').toLowerCase()
const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const geminiBaseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai'
const personaFilePath = path.join(process.cwd(), 'persona', 'AI_INTERVIEWER_PERSONA.md')
let interviewerPersona = ''

try {
  interviewerPersona = readFileSync(personaFilePath, 'utf8').trim()
} catch {
  interviewerPersona = ''
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: geminiBaseUrl,
})

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const systemPromptMap = {
  'job-interview': `You are a senior interviewer conducting a behavioral interview.
Ask practical follow-up questions.
Evaluate clarity, structure, and ownership.
Stay direct but fair.
Keep each response under 90 words.
Finish with a brief summary near the final turn.`,
  'salary-negotiation': `You are a hiring manager in a salary negotiation.
Stay professional, concise, and realistic.
Push back when requests are weakly justified.
Reward strong evidence and clear impact statements.
Keep each response under 80 words.
Try to reach a practical outcome by 8 turns.`,
}

const getPersonaBlock = (scenarioId) => {
  if (scenarioId !== 'job-interview' || !interviewerPersona) return ''
  return `Interviewer Persona:\n${interviewerPersona}`
}

const buildContextLine = (scenarioId, negotiationState, interviewState, turnCount) => {
  if (scenarioId === 'salary-negotiation') {
    return `Current offer: ${negotiationState?.currentOffer}. User ask: ${negotiationState?.userLastAsk || 'none'}. Deal closed: ${negotiationState?.dealClosed}.`
  }
  if (scenarioId === 'job-interview') {
    return `Questions asked: ${interviewState?.questionIndex}. Follow-up mode: ${interviewState?.followUpMode}.`
  }
  return `Turn count: ${turnCount}.`
}

const buildBrainContext = (scenarioId, brainProfile) => {
  const resumeText = brainProfile?.resumeText?.trim()
  const jobDescriptionText = brainProfile?.jobDescriptionText?.trim()
  const interviewFocus = brainProfile?.interviewFocus?.trim()
  const customQuestions = brainProfile?.customQuestions?.trim()
  const analysisSummary = brainProfile?.analysisSummary?.trim()
  const generatedQuestions =
    scenarioId === 'job-interview'
      ? brainProfile?.generatedInterviewQuestions || []
      : brainProfile?.generatedNegotiationQuestions || []
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

  return [
    'Candidate Profile:',
    resumeText || 'Not provided',
    'Target Role Description:',
    jobDescriptionText || 'Not provided',
    'Negotiation focus:',
    interviewFocus || 'Compensation and scope alignment',
    'AI Brain Candidate-specific Questions:',
    generatedQuestions.length ? generatedQuestions.join('\n') : 'Not generated yet',
  ].join('\n')
}

const extractJsonBlock = (text = '') => {
  const raw = text.trim()
  if (raw.startsWith('{') && raw.endsWith('}')) return raw
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch?.[1]) {
    const fencedRaw = fencedMatch[1].trim()
    if (fencedRaw.startsWith('{') && fencedRaw.endsWith('}')) return fencedRaw
  }
  const match = raw.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

const createModelText = async ({ system, messages, maxTokens, temperature, jsonMode = false }) => {
  const model = brainProvider === 'gemini' ? geminiModel : openaiModel
  const client = brainProvider === 'gemini' ? gemini : openai
  const request = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: 'system', content: system },
      ...messages.map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: `${message.content || ''}`,
      })),
    ],
  }
  if (jsonMode) {
    request.response_format = { type: 'json_object' }
  }
  try {
    const completion = await client.chat.completions.create(request)
    return completion.choices?.[0]?.message?.content?.trim() || ''
  } catch (error) {
    if (!jsonMode) throw error
    const completion = await client.chat.completions.create({
      ...request,
      response_format: undefined,
    })
    return completion.choices?.[0]?.message?.content?.trim() || ''
  }
}

app.get('/api/brain/health', (_req, res) => {
  const usingGemini = brainProvider === 'gemini'
  res.json({
    ok: true,
    provider: usingGemini ? 'gemini' : 'openai',
    hasKey: usingGemini ? Boolean(process.env.GEMINI_API_KEY) : Boolean(process.env.OPENAI_API_KEY),
    model: usingGemini ? geminiModel : openaiModel,
    personaLoaded: Boolean(interviewerPersona),
  })
})

app.post('/api/brain/analyze', async (req, res) => {
  const brainProfile = req.body || {}
  if (!brainProfile.resumeText?.trim() || !brainProfile.jobDescriptionText?.trim()) {
    return res.status(400).json({ error: 'resumeText and jobDescriptionText are required' })
  }
  try {
    const content = await createModelText({
      maxTokens: 1000,
      temperature: 0.2,
      jsonMode: true,
      system: [
        'You are a hiring coach and compensation strategist. Return valid JSON only with keys summary, interviewQuestions, negotiationQuestions. interviewQuestions and negotiationQuestions must each contain 5 to 8 concise strings.',
        getPersonaBlock('job-interview'),
      ]
        .filter(Boolean)
        .join('\n\n'),
      messages: [
        {
          role: 'user',
          content: [
            'Candidate Resume:',
            brainProfile.resumeText || 'Not provided',
            'Job Description:',
            brainProfile.jobDescriptionText || 'Not provided',
            'Focus Areas:',
            brainProfile.interviewFocus || 'General interview readiness',
            'Must Ask:',
            brainProfile.customQuestions || 'None',
          ].join('\n'),
        },
      ],
    })
    let json = extractJsonBlock(content)
    if (!json) {
      const repaired = await createModelText({
        maxTokens: 700,
        temperature: 0,
        jsonMode: true,
        system: 'Return only valid JSON object.',
        messages: [
          {
            role: 'user',
            content: `Convert this to strict JSON object with keys summary, interviewQuestions, negotiationQuestions:\n${content}`,
          },
        ],
      })
      json = extractJsonBlock(repaired)
    }
    if (!json) {
      return res.status(500).json({ error: 'Invalid model response format' })
    }
    const parsed = JSON.parse(json)
    const interviewQuestions = Array.isArray(parsed.interviewQuestions)
      ? parsed.interviewQuestions.map((question) => `${question}`.trim()).filter(Boolean).slice(0, 8)
      : []
    const negotiationQuestions = Array.isArray(parsed.negotiationQuestions)
      ? parsed.negotiationQuestions.map((question) => `${question}`.trim()).filter(Boolean).slice(0, 8)
      : []
    if (!parsed.summary || !interviewQuestions.length || !negotiationQuestions.length) {
      return res.status(500).json({ error: 'Incomplete model response' })
    }
    return res.json({
      summary: `${parsed.summary}`.trim(),
      interviewQuestions,
      negotiationQuestions,
    })
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Brain analysis failed' })
  }
})

app.post('/api/brain/respond', async (req, res) => {
  const {
    scenarioId,
    messages = [],
    negotiationState = {},
    interviewState = {},
    turnCount = 0,
    brainProfile = {},
  } = req.body || {}
  const systemPrompt = systemPromptMap[scenarioId]
  if (!systemPrompt) {
    return res.status(400).json({ error: 'Invalid scenarioId' })
  }
  try {
    const contextLine = buildContextLine(scenarioId, negotiationState, interviewState, turnCount)
    const brainContext = buildBrainContext(scenarioId, brainProfile)
    const formattedMessages = messages.slice(-10).map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: `${message.content || ''}`,
    }))
    const text = await createModelText({
      maxTokens: 280,
      temperature: 0.7,
      system: [systemPrompt, getPersonaBlock(scenarioId), contextLine, brainContext].filter(Boolean).join('\n\n'),
      messages: formattedMessages,
    })
    if (!text) {
      return res.status(500).json({ error: 'Empty model response' })
    }
    return res.json({ text })
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Brain response failed' })
  }
})

app.post('/api/brain/feedback', async (req, res) => {
  const { scenarioId, messages = [], brainProfile = {} } = req.body || {}
  if (!systemPromptMap[scenarioId]) {
    return res.status(400).json({ error: 'Invalid scenarioId' })
  }
  const transcript = messages
    .map((message) => `${message.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${message.content || ''}`)
    .join('\n')
  if (!transcript.trim()) {
    return res.status(400).json({ error: 'Conversation transcript is required' })
  }
  try {
    const content = await createModelText({
      maxTokens: 900,
      temperature: 0.2,
      jsonMode: true,
      system: [
        'You are an interview and negotiation coach. Return valid JSON only with keys summary, score, strengths, tips, keynotes.',
        'summary must be one short paragraph.',
        'score must be integer 1-100.',
        'strengths, tips, keynotes must be arrays with 3 to 6 concise strings each.',
        getPersonaBlock(scenarioId),
      ]
        .filter(Boolean)
        .join('\n\n'),
      messages: [
        {
          role: 'user',
          content: [
            `Scenario: ${scenarioId}`,
            'Candidate Profile:',
            brainProfile.resumeText || 'Not provided',
            'Target Role Description:',
            brainProfile.jobDescriptionText || 'Not provided',
            'Conversation Transcript:',
            transcript,
          ].join('\n'),
        },
      ],
    })
    let json = extractJsonBlock(content)
    if (!json) {
      const repaired = await createModelText({
        maxTokens: 700,
        temperature: 0,
        jsonMode: true,
        system: 'Return only valid JSON object.',
        messages: [
          {
            role: 'user',
            content: `Convert this to strict JSON object with keys summary, score, strengths, tips, keynotes:\n${content}`,
          },
        ],
      })
      json = extractJsonBlock(repaired)
    }
    if (!json) {
      return res.status(500).json({ error: 'Invalid model response format' })
    }
    const parsed = JSON.parse(json)
    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.map((value) => `${value}`.trim()).filter(Boolean).slice(0, 6)
      : []
    const tips = Array.isArray(parsed.tips)
      ? parsed.tips.map((value) => `${value}`.trim()).filter(Boolean).slice(0, 6)
      : []
    const keynotes = Array.isArray(parsed.keynotes)
      ? parsed.keynotes.map((value) => `${value}`.trim()).filter(Boolean).slice(0, 6)
      : []
    const score = Number(parsed.score)
    if (!parsed.summary || !Number.isFinite(score) || !strengths.length || !tips.length || !keynotes.length) {
      return res.status(500).json({ error: 'Incomplete feedback payload' })
    }
    return res.json({
      summary: `${parsed.summary}`.trim(),
      score: Math.max(1, Math.min(100, Math.round(score))),
      strengths,
      tips,
      keynotes,
    })
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Brain feedback failed' })
  }
})

const distPath = path.join(process.cwd(), 'dist')
const indexPath = path.join(distPath, 'index.html')
if (existsSync(indexPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(indexPath)
  })
}

app.listen(port, () => {
  process.stdout.write(`AI Brain server running on http://localhost:${port}\n`)
})
