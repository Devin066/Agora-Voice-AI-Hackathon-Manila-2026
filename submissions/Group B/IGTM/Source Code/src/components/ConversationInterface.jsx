import { Mic, MicOff, Send, Square } from 'lucide-react'
import { formatTime } from '../utils/helpers'

function ConversationInterface({
  messages,
  interimText,
  input,
  onInputChange,
  onSend,
  onToggleListening,
  onEndConversation,
  listening,
  disabled,
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/20">
      <div className="h-[380px] space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
              message.role === 'assistant'
                ? 'bg-secondary/30 text-white'
                : 'ml-auto bg-primary/30 text-white'
            }`}
          >
            <p>{message.content}</p>
            <p className="mt-1 text-[11px] text-slate-300">{formatTime(message.timestamp)}</p>
          </div>
        ))}
        {interimText ? (
          <div className="ml-auto max-w-[80%] rounded-xl border border-primary/40 bg-primary/15 px-4 py-3 text-sm text-slate-100">
            {interimText}
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onSend()}
            className="flex-1 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-primary/70 focus:ring-2"
            placeholder="Type your response if voice is unavailable..."
            maxLength={500}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !input.trim()}
            className="rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-50"
          >
            <Send size={16} />
          </button>
          <button
            type="button"
            onClick={onToggleListening}
            disabled={disabled}
            className={`rounded-lg px-3 py-2 text-white ${
              listening ? 'bg-danger' : 'bg-success'
            } disabled:opacity-50`}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            type="button"
            onClick={onEndConversation}
            disabled={disabled}
            className="rounded-lg bg-warning px-3 py-2 text-white disabled:opacity-50"
          >
            <Square size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversationInterface
