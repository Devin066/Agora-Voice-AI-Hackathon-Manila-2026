import { clamp } from '../utils/helpers'

function VoiceVisualizer({ active, level }) {
  const bars = Array.from({ length: 12 })
  return (
    <div className="flex h-16 items-end gap-1 rounded-lg border border-white/10 bg-black/20 p-3">
      {bars.map((_, index) => {
        const barSeed = ((index % 4) + 1) * 0.15
        const target = active ? clamp(level / 100 + barSeed, 0.15, 1) : 0.12
        return (
          <span
            key={index}
            className="w-2 rounded-full bg-secondary transition-all duration-150"
            style={{ height: `${Math.round(target * 100)}%` }}
          />
        )
      })}
    </div>
  )
}

export default VoiceVisualizer
