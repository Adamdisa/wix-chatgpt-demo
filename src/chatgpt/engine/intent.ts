import type { Intent } from "./types";

const has = (s: string, ...words: (string | RegExp)[]) =>
  words.some((w) => (typeof w === "string" ? s.includes(w) : w.test(s)));

export function detectIntent(raw: string): Intent {
  const s = raw.toLowerCase().replace(/@wix/g, " ").trim();

  if (/^(y|yes|yeah|yep|sure|ok|okay|allow|connect|go ahead|please do|do it)\b/.test(s)) return { type: "affirm" };
  if (/^(n|no|nope|nah|cancel|not now|don't|dont)\b/.test(s)) return { type: "decline" };

  const when = has(s, "tomorrow")
    ? "tomorrow"
    : has(s, "tonight", "today")
      ? "today"
      : has(s, "weekend", "saturday", "friday")
        ? "weekend"
        : undefined;

  const time = has(s, "afternoon")
    ? "afternoon"
    : has(s, "morning")
      ? "morning"
      : has(s, "evening", "tonight")
        ? "evening"
        : (s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/)?.[0] ?? undefined);

  if (has(s, "barber", "haircut", "hair cut", "fade", "beard", "trim", "shave", "oren")) {
    return { type: "barber", when, time, city: has(s, "tel aviv") ? "Tel Aviv" : undefined };
  }

  if (
    has(
      s,
      "concert",
      "ticket",
      "event",
      "gig",
      "show",
      "things to do",
      "what's on",
      "whats on",
      "happening",
      "philharmonic",
      "orchestra",
      "classical",
      "symphony",
      "comedy",
      "stand-up",
      "standup",
      "jazz",
      "festival",
      "workshop",
      "arctic",
      "live music",
    )
  ) {
    const filter = has(s, "classical", "philharmonic", "orchestra", "symphony")
      ? "classical"
      : has(s, "comedy", "stand-up", "standup", "laugh")
        ? "comedy"
        : has(s, "concert", "gig", "live music", "jazz", "arctic", "band")
          ? "music"
          : has(s, "food", "market", "eat")
            ? "food"
            : has(s, "kids", "family")
              ? "family"
              : "all";
    return { type: "events", filter, when };
  }

  if (has(s, "pizza", "restaurant", "dinner", "lunch", "brunch", "table", "reserv", "eat", "hungry", "food")) {
    const party = Number(s.match(/\b(?:for|table of|party of)\s*(\d{1,2})\b/)?.[1] ?? s.match(/\b(\d{1,2})\s*(?:people|ppl|guests|persons)\b/)?.[1] ?? 2);
    return { type: "restaurant", party: Math.min(Math.max(party, 1), 12), when };
  }

  return { type: "unknown" };
}

export function titleFor(text: string): string {
  const i = detectIntent(text);
  switch (i.type) {
    case "barber":
      return "Haircut booking";
    case "events":
      return i.filter === "classical" ? "Classical concerts" : i.filter === "comedy" ? "Comedy tonight" : "Events this week";
    case "restaurant":
      return "Dinner reservation";
    default:
      return text.length > 36 ? `${text.slice(0, 36)}…` : text;
  }
}
