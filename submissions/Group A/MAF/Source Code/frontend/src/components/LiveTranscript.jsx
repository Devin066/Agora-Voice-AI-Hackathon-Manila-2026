function LiveTranscript({ text, listening }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-headline text-lg">Live Transcription</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            listening
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {listening ? "Listening..." : "Idle"}
        </span>
      </div>
      <p className="min-h-20 text-slate-700">
        {text || "Patient speech transcript will appear here."}
      </p>
    </div>
  );
}

export default LiveTranscript;
