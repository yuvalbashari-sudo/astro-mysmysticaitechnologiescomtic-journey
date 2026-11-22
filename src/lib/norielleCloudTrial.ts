// Bounded Israeli trial. This URL grants no access to the server's management UI.
export const norielleCloudTrial = {
  enabled: import.meta.env.VITE_NORIELLE_TRIAL_ENABLED === "1",
  origin: "https://kk8g8bel5j08x6-8888.proxy.runpod.net",
  endsAt: Date.parse("2026-11-23T06:05:38Z"),
};

export type NorielleOpening = {
  cards: string[];
  reading: string;
  question: string;
};

export function openingForConversation(cards: readonly { id: string }[], reading: string, question: string): NorielleOpening | null {
  if (cards.length !== 3 || new Set(cards.map(card => card.id)).size !== 3 || !reading.trim()) return null;
  if (reading.length > 12000 || question.length > 600) return null;
  return { cards: cards.map(card => card.id), reading, question };
}
