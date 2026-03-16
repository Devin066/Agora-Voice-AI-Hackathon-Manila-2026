import { v } from "convex/values";

export const supportCategoryValidator = v.union(
  v.literal("slow_internet"),
  v.literal("connectivity"),
  v.literal("billing"),
  v.literal("account"),
  v.literal("hardware"),
  v.literal("setup"),
  v.literal("general"),
);

export const ticketPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
);

export const ticketStatusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("resolved"),
);

export const callStatusValidator = v.union(
  v.literal("waiting"),
  v.literal("active"),
  v.literal("ended"),
);

export const transcriptMessageValidator = v.object({
  role: v.union(
    v.literal("customer"),
    v.literal("assistant"),
    v.literal("system"),
  ),
  content: v.string(),
});

export const transcriptValidator = v.array(transcriptMessageValidator);
