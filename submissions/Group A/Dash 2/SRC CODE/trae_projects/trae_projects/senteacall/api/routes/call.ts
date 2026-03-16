
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { startConversationalAIAgent } from '../services/agoraService.js';

const router = express.Router();

// Start a call session
router.post('/start', async (req, res) => {
  const { userId, callerNumber, channel, token } = req.body;
  
  if (!userId || !callerNumber) {
    return res.status(400).json({ error: 'Missing userId or callerNumber' });
  }

  const sessionId = uuidv4();
  
  // Create a channel name if one wasn't provided (e.g. using the sessionId)
  const channelName = channel || `channel_${sessionId}`;
  
  let agentId = null;
  let agentStatus = 'NOT_STARTED';

  try {
    // Start the conversational AI agent
    const aiResponse = await startConversationalAIAgent({
      channel: channelName,
      token: token || '',
    });
    
    agentId = aiResponse.agent_id;
    agentStatus = aiResponse.status;
  } catch (error: any) {
    console.error('Failed to start AI Agent on call start:', error.message);
    // Depending on requirements, we might want to fail the call start entirely,
    // but here we just log and proceed with the call session without the agent for now,
    // or return a 500 error. Let's return a 500 error to be safe as AI is core to this app.
    return res.status(500).json({ error: 'Failed to initialize AI security agent' });
  }

  // In a real app, we would store the session in the DB here
  // await supabase.from('call_sessions').insert({ ... })

  res.json({
    sessionId,
    channel: channelName,
    agentId,
    status: agentStatus, // Should be 'RUNNING'
    wsUrl: `ws://localhost:${process.env.PORT || 3001}` // Simplified for local dev
  });
});

export default router;
