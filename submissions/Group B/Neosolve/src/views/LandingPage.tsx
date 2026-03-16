import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DEMO_SCENARIOS, getScenarioById } from "../demoScenarios";
import {
  joinChannel,
  leaveChannel,
  toggleMute,
  type CallSessionState,
} from "../lib/agoraClient";
import type { Id } from "../../convex/_generated/dataModel";
import {
  SectionHeading,
  ActionButton,
  Tag,
  getErrorMessage,
  humanizeToken,
  humanizePriority,
} from "../components/ui";
import { LiveCallPanel } from "../components/LiveCallPanel";

type PendingAction = "seeding" | "resetting" | "starting" | null;

type InputMode = "live" | "demo";

type LiveCallInfo = {
  callId: Id<"calls">;
  agentId: string;
  channelName: string;
  startedAt: number;
};

export function LandingPage() {
  const [inputMode, setInputMode] = useState<InputMode>("live");
  const [customerName, setCustomerName] = useState("Alyssa");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    DEMO_SCENARIOS[0].id,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live call state
  const [callState, setCallState] = useState<CallSessionState>("idle");
  const [liveCall, setLiveCall] = useState<LiveCallInfo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ensureDemoReady = useMutation(api.demo.ensureDemoReady);
  const resetDemo = useMutation(api.demo.resetDemo);
  const startCallMutation = useMutation(api.calls.startCall);

  // Agora actions
  const generateToken = useAction(api.agora.generateToken);
  const startAgent = useAction(api.agora.startAgent);
  const processCallEnd = useAction(api.callActions.processCallEnd);

  const selectedScenario = useMemo(
    () => getScenarioById(selectedScenarioId),
    [selectedScenarioId],
  );

  useEffect(() => {
    void ensureDemoReady({}).catch((error: unknown) => {
      setErrorMessage(getErrorMessage(error));
    });
  }, [ensureDemoReady]);

  // Auto-dismiss feedback and error messages
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // Call duration timer
  useEffect(() => {
    if (callState === "connected" && liveCall) {
      durationRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - liveCall.startedAt) / 1000));
      }, 1000);
    } else {
      if (durationRef.current) {
        clearInterval(durationRef.current);
        durationRef.current = null;
      }
      if (callState === "idle") {
        setCallDuration(0);
      }
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [callState, liveCall]);

  async function handleResetDemo() {
    setPendingAction("resetting");
    setFeedback(null);
    setErrorMessage(null);

    try {
      const result = await resetDemo({});
      setFeedback(`Reset complete. ${result.agentCount} demo agents ready.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEnsureDemoReady() {
    setPendingAction("seeding");
    setFeedback(null);
    setErrorMessage(null);

    try {
      const result = await ensureDemoReady({});
      setFeedback(
        `Demo agents ready. ${result.agentCount} specialists loaded.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }

  // ── Live call flow ─────────────────────────────────────────────
  const handleStartLiveCall = useCallback(async () => {
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setErrorMessage("Add a customer name before starting a call.");
      return;
    }

    setCallState("joining");
    setFeedback(null);
    setErrorMessage(null);

    try {
      const channelName = "neosolve";

      const { token, appId } = await generateToken({
        channelName,
        uid: 0,
      });

      const session = await joinChannel({
        appId,
        channelName,
        token: token || null,
      });

      const customerUid = String(session.uid);

      const { callId } = await startCallMutation({
        customerName: trimmedName,
        customerPhone: customerPhone.trim() || undefined,
        channelName,
      });

      const agentResult = await startAgent({
        channelName,
        customerUid,
        token: token || "",
      });

      setLiveCall({
        callId,
        agentId: agentResult.agentId,
        channelName,
        startedAt: Date.now(),
      });
      setCallState("connected");
      setFeedback(
        `Connected! Neo is greeting ${trimmedName}. Speak into your microphone.`,
      );
    } catch (error) {
      setCallState("error");
      setErrorMessage(getErrorMessage(error));
      try {
        await leaveChannel();
      } catch {
        // ignore cleanup errors
      }
    }
  }, [
    customerName,
    customerPhone,
    generateToken,
    startCallMutation,
    startAgent,
  ]);

  const handleEndLiveCall = useCallback(async () => {
    if (!liveCall) return;
    if (!window.confirm("End this call?")) return;

    setCallState("leaving");
    setFeedback(null);
    setErrorMessage(null);

    try {
      await leaveChannel();

      const result = await processCallEnd({
        callId: liveCall.callId,
        agentId: liveCall.agentId,
      });

      setFeedback(
        result.assignedAgentName
          ? `Call ended. Ticket routed to ${result.assignedAgentName}.`
          : "Call ended. Ticket created without an assigned agent.",
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLiveCall(null);
      setCallState("idle");
      setIsMuted(false);
    }
  }, [liveCall, processCallEnd]);

  const handleToggleMute = useCallback(async () => {
    try {
      const newMuted = await toggleMute();
      setIsMuted(newMuted);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, []);

  // ── Demo script flow ──────────────────────────────────────────
  async function handleStartDemoCall() {
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setErrorMessage("Add a customer name before starting a call.");
      return;
    }

    setPendingAction("starting");
    setFeedback(null);
    setErrorMessage(null);

    try {
      const result = await startCallMutation({
        customerName: trimmedName,
        customerPhone: customerPhone.trim() || undefined,
        channelName: `${selectedScenario.channelPrefix}-${Date.now()}`,
        notes: selectedScenario.notes,
        transcript: selectedScenario.transcript,
      });
      void result; // callId available for future use
      setFeedback(
        `Call started for ${trimmedName}. End it to create a ticket for ${selectedScenario.expectedAgent}.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }

  const isInCall = callState === "connected" || callState === "joining";

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr] xl:items-start">
      <section className="space-y-4 rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5 flex flex-col h-full">
        <SectionHeading eyebrow="Call controls" title="Start a Support Call" />

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-0 rounded-md border-2 border-black overflow-hidden">
          <button
            type="button"
            onClick={() => setInputMode("live")}
            disabled={isInCall}
            className={[
              "px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all border-r-2 border-black",
              inputMode === "live"
                ? "bg-[#2a6de1] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50",
              isInCall ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            Live call
          </button>
          <button
            type="button"
            onClick={() => setInputMode("demo")}
            disabled={isInCall}
            className={[
              "px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all",
              inputMode === "demo"
                ? "bg-[#2a6de1] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50",
              isInCall ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            Demo script
          </button>
        </div>

        {/* Shared: customer name + admin buttons */}
        <div className="grid gap-2 sm:grid-cols-3">
          <ActionButton
            busy={pendingAction === "seeding"}
            onClick={() => void handleEnsureDemoReady()}
            tone="secondary"
          >
            Seed agents
          </ActionButton>
          <ActionButton
            busy={pendingAction === "resetting"}
            onClick={() => void handleResetDemo()}
            tone="secondary"
          >
            Reset demo
          </ActionButton>
          {inputMode === "demo" ? (
            <ActionButton
              busy={pendingAction === "starting"}
              onClick={() => void handleStartDemoCall()}
            >
              Start call
            </ActionButton>
          ) : (
            <div /> /* spacer */
          )}
        </div>

        <label className="grid gap-2 text-sm font-bold text-slate-900 font-mono uppercase tracking-tight">
          Customer name
          <input
            className="rounded-md border-2 border-black bg-white px-4 py-3 text-base text-slate-900 outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter customer name"
            disabled={isInCall}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-900 font-mono uppercase tracking-tight">
          Phone number
          <span className="text-[10px] font-medium text-slate-500 normal-case tracking-normal">
            For SMS ticket acknowledgement (e.g. +639123456789)
          </span>
          <input
            className="rounded-md border-2 border-black bg-white px-4 py-3 text-base text-slate-900 outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="+639XXXXXXXXX"
            type="tel"
            disabled={isInCall}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5 flex flex-col h-full">
        <SectionHeading
          eyebrow={inputMode === "live" ? "Voice channel" : "Demo selection"}
          title={
            inputMode === "live" ? "Live Call Activity" : "Select Scenario"
          }
        />

        {/* ── Live call mode ──────────────────────────────── */}
        {inputMode === "live" && (
          <>
            {callState === "idle" || callState === "error" ? (
              <ActionButton
                busy={false}
                onClick={() => void handleStartLiveCall()}
              >
                Call now
              </ActionButton>
            ) : null}

            {callState === "joining" ? (
              <div className="rounded-md border-2 border-black bg-[#f5ce4d] p-5 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-lg font-black text-black animate-pulse">
                  Connecting to Neo...
                </p>
              </div>
            ) : null}

            {callState === "connected" ? (
              <LiveCallPanel
                duration={callDuration}
                isMuted={isMuted}
                onToggleMute={() => void handleToggleMute()}
                onEndCall={() => void handleEndLiveCall()}
              />
            ) : null}

            {callState === "leaving" ? (
              <div className="rounded-md border-2 border-black bg-slate-900 p-5 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-lg font-black text-white animate-pulse">
                  Processing call...
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Creating ticket and routing to a specialist.
                </p>
              </div>
            ) : null}
          </>
        )}

        {/* ── Demo script mode ───────────────────────────── */}
        {inputMode === "demo" && (
          <>
            <div className="grid gap-2">
              {DEMO_SCENARIOS.map((scenario) => {
                const isSelected = scenario.id === selectedScenarioId;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={[
                      "grid gap-2 rounded-md border-2 px-4 py-3 text-left transition-all group",
                      isSelected
                        ? "border-black bg-[#f5ce4d] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                        : "border-black bg-white hover:bg-slate-50 shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {scenario.title}
                        </p>
                        <p className="text-sm text-slate-600">
                          {scenario.preview}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {humanizeToken(scenario.expectedCategory)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                      <Tag>{scenario.expectedAgent}</Tag>
                      <Tag>{humanizePriority(scenario.expectedPriority)}</Tag>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-md border-2 border-black bg-white p-4 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#2a6de1] font-mono">
                    Selected script
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    {selectedScenario.title}
                  </h2>
                </div>
                <div className="rounded-sm border-2 border-black bg-[#2a6de1] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Routes to {selectedScenario.expectedAgent}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                {selectedScenario.notes}
              </p>
            </div>
          </>
        )}

        {feedback ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </section>
    </div>
  );
}
