import { SCENARIOS } from '../utils/constants'

const scenarioList = Object.values(SCENARIOS)

function ScenarioSelector({ currentScenario, onSelect }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {scenarioList.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          onClick={() => scenario.available && onSelect(scenario.id)}
          disabled={!scenario.available}
          className={`rounded-xl border p-4 text-left transition ${
            currentScenario === scenario.id
              ? 'border-primary bg-primary/20'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          } ${!scenario.available ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <p className="text-2xl">{scenario.icon}</p>
          <p className="mt-2 text-lg font-semibold text-white">{scenario.name}</p>
          <p className="mt-1 text-sm text-slate-300">{scenario.description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
            <span className="rounded bg-white/10 px-2 py-1">{scenario.difficulty}</span>
            <span className="rounded bg-white/10 px-2 py-1">{scenario.avgDuration}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ScenarioSelector
