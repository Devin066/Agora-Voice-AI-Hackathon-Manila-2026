export function LiveCallPanel(props: {
  duration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
}) {
  const minutes = Math.floor(props.duration / 60);
  const seconds = props.duration % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="grid gap-3 rounded-md border-2 border-black bg-slate-900 p-5 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <span className="flex items-center gap-2 rounded-full border-2 border-[#2a6de1] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2a6de1]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2a6de1]" />
              Live call with Neo
            </span>
          </div>
        </div>
        <p className="text-2xl font-black font-mono tabular-nums">
          {timeDisplay}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={props.onToggleMute}
          className={[
            "rounded-md border-2 border-white/20 px-4 py-3 text-sm font-bold transition-all",
            props.isMuted
              ? "bg-[#f5ce4d] text-black"
              : "bg-white/10 text-white hover:bg-white/20",
          ].join(" ")}
        >
          {props.isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={props.onEndCall}
          className="rounded-md border-2 border-[#e03b24] bg-[#e03b24] px-4 py-3 text-sm font-bold text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          End call
        </button>
      </div>
    </div>
  );
}
