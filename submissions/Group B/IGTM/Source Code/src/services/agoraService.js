import AgoraRTC from 'agora-rtc-sdk-ng'

class AgoraService {
  constructor() {
    this.client = null
    this.localAudioTrack = null
    this.appId = import.meta.env.VITE_AGORA_APP_ID
    this.isJoined = false
  }

  async initialize() {
    this.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8',
    })
  }

  async joinChannel(channelName, token = null, preferredUid = null) {
    if (!this.client) {
      await this.initialize()
    }
    const uid =
      preferredUid !== undefined && preferredUid !== null && `${preferredUid}`.trim() !== ''
        ? preferredUid
        : Math.floor(Math.random() * 100000)
    const normalizedToken =
      token !== undefined && token !== null && `${token}`.trim() !== '' ? `${token}`.trim() : null
    await this.client.join(this.appId, channelName, normalizedToken, uid)
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    await this.client.publish([this.localAudioTrack])
    this.isJoined = true
    return uid
  }

  async leaveChannel() {
    if (this.localAudioTrack) {
      this.localAudioTrack.close()
      this.localAudioTrack = null
    }
    if (this.client && this.isJoined) {
      await this.client.leave()
      this.isJoined = false
    }
  }
}

export default new AgoraService()
