export type AgeGroup = "early" | "growing" | "preteen";

export interface Prompt {
  id: string;
  text: string;
  phonemeTarget: string;
  ageGroups: AgeGroup[];
  imageEmoji: string;
}

export const PROMPTS: Prompt[] = [
  // R sounds
  { id: "r1", text: "The red rabbit runs really fast", phonemeTarget: "R", ageGroups: ["growing", "preteen"], imageEmoji: "🐇" },
  { id: "r2", text: "Rain, rain, go away", phonemeTarget: "R", ageGroups: ["early", "growing"], imageEmoji: "🌧️" },
  { id: "r3", text: "A rainbow has many colors", phonemeTarget: "R", ageGroups: ["early", "growing"], imageEmoji: "🌈" },
  // S sounds
  { id: "s1", text: "See the shiny stars", phonemeTarget: "S", ageGroups: ["early", "growing"], imageEmoji: "⭐" },
  { id: "s2", text: "The snake slid slowly", phonemeTarget: "S", ageGroups: ["growing", "preteen"], imageEmoji: "🐍" },
  { id: "s3", text: "Sunshine makes me smile", phonemeTarget: "S", ageGroups: ["early"], imageEmoji: "☀️" },
  // L sounds
  { id: "l1", text: "Lily loves lemonade", phonemeTarget: "L", ageGroups: ["early", "growing"], imageEmoji: "🍋" },
  { id: "l2", text: "The little lion leaped", phonemeTarget: "L", ageGroups: ["growing", "preteen"], imageEmoji: "🦁" },
  { id: "l3", text: "Look at the lovely lamp", phonemeTarget: "L", ageGroups: ["early"], imageEmoji: "💡" },
  // TH sounds
  { id: "th1", text: "Three thick thumbs", phonemeTarget: "TH", ageGroups: ["growing", "preteen"], imageEmoji: "👍" },
  { id: "th2", text: "The thin thread broke", phonemeTarget: "TH", ageGroups: ["preteen"], imageEmoji: "🧵" },
  // SH sounds
  { id: "sh1", text: "She sells seashells", phonemeTarget: "SH", ageGroups: ["growing", "preteen"], imageEmoji: "🐚" },
  { id: "sh2", text: "A ship sails on the shore", phonemeTarget: "SH", ageGroups: ["early", "growing"], imageEmoji: "⛵" },
  // Simple words for early learners
  { id: "e1", text: "Say hello to the puppy", phonemeTarget: "P", ageGroups: ["early"], imageEmoji: "🐶" },
  { id: "e2", text: "I can count to ten", phonemeTarget: "T", ageGroups: ["early"], imageEmoji: "🔢" },
  { id: "e3", text: "Butterflies are beautiful", phonemeTarget: "B", ageGroups: ["early", "growing"], imageEmoji: "🦋" },
];

export function getPromptsForAge(ageGroup: AgeGroup, count = 5): Prompt[] {
  const filtered = PROMPTS.filter((p) => p.ageGroups.includes(ageGroup));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAgeGroup(age: number): AgeGroup {
  if (age <= 7) return "early";
  if (age <= 10) return "growing";
  return "preteen";
}
