class SpeechService {
  constructor() {
    this.recognition = null
    this.onTranscriptCallback = null
    this.onInterimCallback = null
    this.isListening = false
  }

  initializeRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      throw new Error('Speech recognition is not supported in this browser')
    }
    this.recognition = new Recognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    this.recognition.onresult = (event) => {
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result[0]?.transcript?.trim()
        if (!transcript) continue
        if (result.isFinal) {
          this.onTranscriptCallback?.(transcript)
        } else {
          interim = transcript
        }
      }
      if (interim) {
        this.onInterimCallback?.(interim)
      }
    }
    this.recognition.onerror = () => {
      this.stopListening()
    }
    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start()
      }
    }
  }

  async startListening(onTranscript, onInterim) {
    if (!this.recognition) {
      this.initializeRecognition()
    }
    this.onTranscriptCallback = onTranscript
    this.onInterimCallback = onInterim
    this.isListening = true
    this.recognition.start()
  }

  stopListening() {
    this.isListening = false
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  async speak(text, voiceId = 'pNInz6obpgDQGcFmaJgB') {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) {
      return this.fallbackSpeak(text)
    }
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.7,
          },
        }),
      })
      if (!response.ok) {
        throw new Error('ElevenLabs request failed')
      }
      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)
      await new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        audio.onerror = reject
        audio.play().catch(reject)
      })
    } catch {
      await this.fallbackSpeak(text)
    }
  }

  fallbackSpeak(text) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.onend = resolve
      window.speechSynthesis.speak(utterance)
    })
  }

  cancelSpeech() {
    window.speechSynthesis.cancel()
  }
}

export default new SpeechService()
