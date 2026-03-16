import { jsonErr, jsonOk, readJson } from "@/app/api/_util";
import { requireUser } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";
import { answerWithSchoolContext } from "@/lib/server/ai";
import { getStore, storeId, storeNowIso } from "@/lib/server/store";
import type { ChatLog, ChatMessage } from "@/lib/types";

export async function POST(req: Request) {
  const body = await readJson<{ schoolId?: string; messages?: ChatMessage[] }>(req);
  const schoolId = body.schoolId?.trim();
  const messages = body.messages ?? [];
  if (!schoolId) return jsonErr("schoolId is required", 400, "VALIDATION");

  const user = await requireUser({ schoolId });
  const text = await answerWithSchoolContext({ schoolId, messages });

  const store = getStore();
  const log: ChatLog = {
    id: storeId(),
    schoolId,
    userId: user.id,
    messages: [
      ...messages,
      { role: "assistant", content: text, at: storeNowIso() },
    ],
    createdAt: storeNowIso(),
  };
  store.chats.set(log.id, log);

  writeAudit({
    action: "ai.chat",
    actor: user,
    schoolId,
    metadata: { chatLogId: log.id },
  });

  return jsonOk({ reply: text, chatLogId: log.id });
}
