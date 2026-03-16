import agoraService from './agoraService'

class AgoraAgentService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_AGORA_SAMPLE_BACKEND_URL?.trim() || ''
    this.voiceRuntime = (import.meta.env.VITE_VOICE_RUNTIME || 'native').toLowerCase()
    this.startPath = import.meta.env.VITE_AGORA_AGENT_START_PATH?.trim() || '/start-agent'
    this.stopPath = import.meta.env.VITE_AGORA_AGENT_STOP_PATH?.trim() || '/hangup-agent'
    this.profile = import.meta.env.VITE_AGORA_PROFILE?.trim() || 'VOICE'
    this.detectedStartPath = null
    this.detectedStopPath = null
    this.session = null
  }

  normalizeRtcToken(value) {
    if (value === undefined || value === null) return null
    if (typeof value === 'object') {
      const objectToken =
        value.token ||
        value.rtcToken ||
        value.rtc_token ||
        value.userToken ||
        value.user_token ||
        null
      if (objectToken !== undefined && objectToken !== null) {
        return this.normalizeRtcToken(objectToken)
      }
    }
    let token = value
    if (typeof token !== 'string') {
      try {
        token = JSON.stringify(token)
      } catch {
        token = `${token}`
      }
    }
    token = token.trim()
    if (!token) return null
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      try {
        const unwrapped = JSON.parse(token)
        if (typeof unwrapped === 'string') token = unwrapped.trim()
      } catch {
        token = token.slice(1, -1).trim()
      }
    }
    return token || null
  }

  validateRtcTokenOrThrow(token, sourceLabel) {
    const normalized = this.normalizeRtcToken(token)
    if (!normalized) {
      throw new Error(
        `Agora backend did not return a usable RTC token${sourceLabel ? ` (${sourceLabel})` : ''}.`,
      )
    }
    if (normalized.length > 2047) {
      throw new Error(
        `Agora backend returned an RTC token that is too long (${normalized.length} chars). Check backend token generation.`,
      )
    }
    for (let i = 0; i < normalized.length; i += 1) {
      if (normalized.charCodeAt(i) > 127) {
        throw new Error(
          `Agora backend returned an RTC token containing non-ASCII characters. Check backend response encoding.`,
        )
      }
    }
    return normalized
  }

  validateAppIdOrThrow(frontendAppId, backendAppId, sourceLabel) {
    const normalizedFrontend = `${frontendAppId || ''}`.trim()
    const normalizedBackend = `${backendAppId || ''}`.trim()
    if (!normalizedFrontend) {
      throw new Error('VITE_AGORA_APP_ID is missing in frontend configuration.')
    }
    if (!/^[a-fA-F0-9]{32}$/.test(normalizedFrontend)) {
      throw new Error('VITE_AGORA_APP_ID is invalid. It must be a 32-character Agora App ID.')
    }
    if (!normalizedBackend) {
      throw new Error(
        `Agora backend did not return appid${sourceLabel ? ` (${sourceLabel})` : ''}. Configure APP_ID on simple-backend and restart it.`,
      )
    }
    if (normalizedBackend !== normalizedFrontend) {
      throw new Error(
        `APP_ID mismatch between frontend and backend${sourceLabel ? ` (${sourceLabel})` : ''}. Use the same Agora project APP_ID in both places.`,
      )
    }
  }

  isAgoraMode() {
    return this.voiceRuntime === 'agora'
  }

  isConfigured() {
    return Boolean(this.baseUrl) && Boolean(import.meta.env.VITE_AGORA_APP_ID)
  }

  buildChannelName(scenarioId) {
    return `arena-${scenarioId}-${Date.now()}`
  }

  async requestBackend(path, payload) {
    if (!this.baseUrl) {
      throw new Error('VITE_AGORA_SAMPLE_BACKEND_URL is missing')
    }
    let response
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      throw new Error(
        `Cannot reach Agora backend at ${this.baseUrl}. Start the agent-samples backend, verify port, and allow CORS for this frontend origin.`,
      )
    }
    if (!response.ok) {
      let message = `Agora backend request failed: ${response.status}`
      try {
        const data = await response.json()
        if (data?.error) message = data.error
      } catch {
        message = `Agora backend request failed: ${response.status}`
      }
      throw new Error(message)
    }
    return response.json()
  }

  async requestBackendGet(path, queryParams) {
    if (!this.baseUrl) {
      throw new Error('VITE_AGORA_SAMPLE_BACKEND_URL is missing')
    }
    const url = new URL(`${this.baseUrl}${path}`)
    Object.entries(queryParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        url.searchParams.set(key, `${value}`)
      }
    })
    let response
    try {
      response = await fetch(url.toString())
    } catch {
      throw new Error(
        `Cannot reach Agora backend at ${this.baseUrl}. Start simple-backend (default port 8082), verify URL, and allow CORS.`,
      )
    }
    if (!response.ok) {
      let message = `Agora backend request failed: ${response.status}`
      try {
        const data = await response.json()
        if (data?.error) message = data.error
      } catch {
        message = `Agora backend request failed: ${response.status}`
      }
      throw new Error(message)
    }
    return response.json()
  }

  flattenResponse(data) {
    if (data && typeof data === 'object' && data.data && typeof data.data === 'object') {
      return { ...data, ...data.data }
    }
    return data
  }

  buildStartPayload(channelName, scenarioId, profileContext) {
    return {
      channelName,
      channel: channelName,
      rtcChannelName: channelName,
      scenarioId,
      profileContext,
      metadata: {
        scenarioId,
        ...profileContext,
      },
    }
  }

  normalizeStartResponse(channelName, raw) {
    const data = this.flattenResponse(raw || {})
    const nested = data.agent_response?.response
    let nestedParsed = {}
    if (typeof nested === 'string') {
      try {
        nestedParsed = JSON.parse(nested)
      } catch {
        nestedParsed = {}
      }
    } else if (nested && typeof nested === 'object') {
      nestedParsed = nested
    }
    const nestedUserToken =
      nestedParsed.user_token && typeof nestedParsed.user_token === 'object'
        ? nestedParsed.user_token.token
        : nestedParsed.user_token
    const directUserToken =
      data.user_token && typeof data.user_token === 'object' ? data.user_token.token : data.user_token
    const rtcToken =
      data.rtcToken ||
      data.userRtcToken ||
      data.userToken ||
      directUserToken ||
      data.token ||
      data.rtc_token ||
      nestedParsed.rtcToken ||
      nestedParsed.userRtcToken ||
      nestedParsed.userToken ||
      nestedUserToken ||
      nestedParsed.token ||
      nestedParsed.rtc_token ||
      null
    const uid =
      data.uid ||
      data.user_uid ||
      data.userId ||
      nestedParsed.uid ||
      nestedParsed.user_uid ||
      nestedParsed.userId ||
      null
    return {
      channelName: data.channelName || data.channel || data.rtcChannelName || channelName,
      rtcToken: this.normalizeRtcToken(rtcToken),
      appId: data.appid || data.appId || nestedParsed.appid || nestedParsed.appId || null,
      sessionId: data.sessionId || data.session_id || data.id || nestedParsed.session_id || null,
      agentId: data.agentId || data.agent_id || data.instanceId || nestedParsed.agent_id || null,
      uid,
    }
  }

  async startViaPath(path, channelName, scenarioId, profileContext) {
    let raw
    if (path.includes('start-agent')) {
      raw = await this.requestBackendGet(path, {
        channel: channelName,
        channelName,
        channel_name: channelName,
        rtcChannelName: channelName,
        profile: this.profile,
        connect: 'true',
      })
    } else {
      const payload = this.buildStartPayload(channelName, scenarioId, profileContext)
      raw = await this.requestBackend(path, payload)
    }
    return this.normalizeStartResponse(channelName, raw)
  }

  async resolveStartSession(channelName, scenarioId, profileContext) {
    const candidatePaths = [
      this.startPath,
      '/start-agent',
      '/api/session/start',
      '/api/agent/start',
      '/api/agents/start',
      '/session/start',
    ]
    const uniquePaths = [...new Set(candidatePaths.filter(Boolean))]
    let lastError = null
    for (const path of uniquePaths) {
      try {
        const bootstrap = await this.startViaPath(path, channelName, scenarioId, profileContext)
        this.validateRtcTokenOrThrow(bootstrap?.rtcToken, path)
        this.detectedStartPath = path
        return bootstrap
      } catch (error) {
        lastError = error
      }
    }
    throw (
      lastError ||
      new Error(
        `Could not resolve Agora start endpoint. Set VITE_AGORA_AGENT_START_PATH for your backend route on ${this.baseUrl}.`,
      )
    )
  }

  async startAgentSession({ scenarioId, profileContext }) {
    const channelName = this.buildChannelName(scenarioId)
    const bootstrap = await this.resolveStartSession(channelName, scenarioId, profileContext)
    const appId = import.meta.env.VITE_AGORA_APP_ID
    this.validateAppIdOrThrow(appId, bootstrap.appId, this.detectedStartPath)
    const rtcToken = this.validateRtcTokenOrThrow(bootstrap.rtcToken, this.detectedStartPath)
    if (!rtcToken) {
      throw new Error(
        'Agora backend did not return an RTC token. Verify simple-backend credentials and /start-agent response.',
      )
    }
    if (appId && rtcToken === appId) {
      throw new Error(
        'Agora backend returned APP_ID as token (static mode). Enable dynamic token generation on backend by setting APP_CERTIFICATE (or VOICE_APP_CERTIFICATE, depending on the sample).',
      )
    }
    const preferredUid =
      typeof bootstrap.uid === 'string' && /^\d+$/.test(bootstrap.uid.trim())
        ? Number.parseInt(bootstrap.uid.trim(), 10)
        : bootstrap.uid
    const uid = await agoraService.joinChannel(bootstrap.channelName || channelName, rtcToken, preferredUid)
    this.session = {
      channelName: bootstrap.channelName || channelName,
      uid,
      rtcToken,
      sessionId: bootstrap.sessionId || null,
      agentId: bootstrap.agentId || null,
    }
    return this.session
  }

  async endAgentSession() {
    if (!this.session) return
    const current = this.session
    this.session = null
    await agoraService.leaveChannel()
    if (this.baseUrl) {
      const candidatePaths = [
        this.detectedStopPath,
        this.stopPath,
        '/hangup-agent',
        '/api/session/stop',
        '/api/agent/stop',
        '/api/agents/stop',
        '/session/stop',
        '/stop-agent',
      ]
      const uniquePaths = [...new Set(candidatePaths.filter(Boolean))]
      const payload = {
        channelName: current.channelName,
        channel: current.channelName,
        sessionId: current.sessionId,
        agentId: current.agentId,
        uid: current.uid,
        profile: this.profile,
      }
      try {
        for (const path of uniquePaths) {
          try {
            if (path.includes('hangup-agent')) {
              await this.requestBackendGet(path, {
                agent_id: current.agentId,
                channel: current.channelName,
                profile: this.profile,
              })
            } else {
              await this.requestBackend(path, payload)
            }
            this.detectedStopPath = path
            return
          } catch {
            continue
          }
        }
      } catch {
        return
      }
    }
  }
}

export default new AgoraAgentService()
