const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder } = require('agora-token');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.VIDEO_APP_ID;
const APP_CERTIFICATE = process.env.VIDEO_APP_CERTIFICATE;
const PORT = process.env.PORT || 3000;

// Helper to generate RTC and RTM tokens
function generateTokens(channelName, uid) {
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid.toString(),
    privilegeExpiredTs
  );

  return { rtcToken, rtmToken };
}

// Endpoint to start the agent
app.post('/api/start-agent', async (req, res) => {
  try {
    const { channelName } = req.body;
    if (!channelName) {
      return res.status(400).json({ error: 'channelName is required' });
    }

    const userUid = Math.floor(Math.random() * 1000000);
    const agentUid = 100; // Fixed UID for the agent
    const { rtcToken: userToken, rtmToken: userRtmToken } = generateTokens(channelName, userUid);
    const { rtcToken: agentToken } = generateTokens(channelName, agentUid);

    // Build TTS config based on vendor
    let tts_config = {
      vendor: process.env.VIDEO_TTS_VENDOR || "elevenlabs"
    };

    if (tts_config.vendor === "minimax") {
      tts_config.params = {
        url: process.env.VIDEO_MINIMAX_URL || "wss://api.minimax.io/ws/v1/t2a_v2",
        key: process.env.VIDEO_TTS_KEY,
        model: process.env.VIDEO_MINIMAX_MODEL || "speech-02-turbo",
        voice_setting: {
          voice_id: process.env.VIDEO_MINIMAX_VOICE_ID || "Filipino_female_1_v1",
          speed: 1,
          vol: 1,
          pitch: 0
        },
        audio_setting: {
          sample_rate: parseInt(process.env.VIDEO_TTS_SAMPLE_RATE) || 24000
        }
      };
      // Only add group_id if it's actually provided in .env
      if (process.env.VIDEO_MINIMAX_GROUP_ID && process.env.VIDEO_MINIMAX_GROUP_ID !== 'YOUR_MINIMAX_GROUP_ID') {
        tts_config.params.group_id = process.env.VIDEO_MINIMAX_GROUP_ID;
      }
    } else {
      // Default to ElevenLabs
      tts_config.params = {
        key: process.env.VIDEO_TTS_KEY,
        model_id: process.env.VIDEO_ELEVENLABS_MODEL,
        voice_id: process.env.VIDEO_TTS_VOICE_ID,
        sample_rate: parseInt(process.env.VIDEO_TTS_SAMPLE_RATE) || 24000
      };
    }

    // Build Avatar config
    let avatar_config = {
      vendor: process.env.VIDEO_AVATAR_VENDOR || "heygen",
      params: {
        api_key: process.env.VIDEO_AVATAR_API_KEY,
        avatar_id: process.env.VIDEO_AVATAR_ID,
      }
    };

    if (avatar_config.vendor === "heygen") {
      avatar_config.params.quality = process.env.VIDEO_HEYGEN_QUALITY || "high";
    }

    // Build the payload for Agora Conversational AI Agent REST API
    const payload = {
      channel: channelName,
      agent_id: "gabAI-agent-" + Date.now(),
      rtc_token: agentToken,
      asr: {
        vendor: process.env.VIDEO_ASR_VENDOR || "ares",
        params: {
          language: process.env.VIDEO_ASR_LANGUAGE || "en-US"
        }
      },
      llm: {
        vendor: process.env.VOICE_LLM_VENDOR || "openai",
        params: {
          api_key: process.env.VOICE_LLM_API_KEY || process.env.VIDEO_LLM_API_KEY,
          model: process.env.VOICE_LLM_MODEL || process.env.VIDEO_LLM_MODEL,
          url: process.env.VOICE_LLM_URL || process.env.VIDEO_LLM_URL,
          prompt: process.env.VIDEO_DEFAULT_PROMPT,
          greeting: process.env.VIDEO_DEFAULT_GREETING
        }
      },
      tts: tts_config,
      avatar: avatar_config,
      vad: {
        silence_duration_ms: parseInt(process.env.VIDEO_VAD_SILENCE_DURATION_MS) || 300
      }
    };

    console.log("Constructed Payload:", JSON.stringify(payload, null, 2));

    // Build Auth Header for Agora API
    const authHeader = `agora token=${userToken}`; // Simplification: using user token for auth if possible, or generate a proper one

    const response = await fetch(`https://api.agora.io/api/conversational-ai-agent/v2/projects/${APP_ID}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Agora API Error:", data);
      return res.status(response.status).json(data);
    }

    res.json({
      success: true,
      channelName,
      userUid,
      userToken,
      userRtmToken,
      agentId: data.agent_id,
      data
    });

  } catch (error) {
    console.error("Start Agent Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to stop the agent
app.post('/api/stop-agent', async (req, res) => {
  try {
    const { channelName, agentId } = req.body;
    if (!channelName || !agentId) {
      return res.status(400).json({ error: 'channelName and agentId are required' });
    }

    // Auth header again
    const { rtcToken } = generateTokens(channelName, 0); // UID 0 for auth token
    const authHeader = `agora token=${rtcToken}`;

    const response = await fetch(`https://api.agora.io/api/conversational-ai-agent/v2/projects/${APP_ID}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        channel: channelName,
        agent_id: agentId
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Stop Agent Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`gabAI Backend running on http://localhost:${PORT}`);
});
