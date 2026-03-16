import { useEffect, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { Tag, EmptyState, ActionButton, formatTimestamp } from "./ui";

type ActiveCall = {
  _id: Id<"calls">;
  customerName: string;
  startedAt: number;
  agoraAgentId?: string | null;
  notes?: string | null;
};

export function ActiveCalls(props: {
  calls: ActiveCall[] | undefined;
  onEndDemoCall: (callId: Id<"calls">) => void;
  pendingAction: string | null;
}) {
  if (!props.calls) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-sm text-slate-500 animate-pulse">Loading calls...</p>
      </div>
    );
  }

  if (props.calls.length === 0) {
    return <EmptyState message="No active calls." />;
  }

  return (
    <>
      {props.calls.map((call) => (
        <ActiveCallCard
          key={call._id}
          call={call}
          onEndDemoCall={props.onEndDemoCall}
          pendingAction={props.pendingAction}
        />
      ))}
    </>
  );
}

function ActiveCallCard(props: {
  call: ActiveCall;
  onEndDemoCall: (callId: Id<"calls">) => void;
  pendingAction: string | null;
}) {
  const { call } = props;
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - call.startedAt) / 1000),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - call.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [call.startedAt]);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <article className="grid gap-2 rounded-[24px] border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">
            {call.customerName}
          </p>
          <p className="text-sm text-slate-600">
            Started {formatTimestamp(call.startedAt)}
            <span className="ml-2 font-mono text-xs text-slate-500">
              {minutes}:{seconds}
            </span>
          </p>
        </div>
        <Tag>{call.agoraAgentId ? "live" : "demo"}</Tag>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        {call.notes ?? "Live voice call in progress."}
      </p>
      {/* Only show end button for demo calls -- live calls end from the call panel */}
      {!call.agoraAgentId && (
        <ActionButton
          busy={props.pendingAction === "ending"}
          onClick={() => void props.onEndDemoCall(call._id)}
        >
          End call and create ticket
        </ActionButton>
      )}
    </article>
  );
}
