import { Globe, Music, Scissors, Ticket, Utensils } from "lucide-react";

import { STARTER_PROMPTS } from "../engine/useConversation";

const ICONS = { scissors: Scissors, ticket: Ticket, utensils: Utensils, music: Music, globe: Globe } as const;

export function SuggestionChips({ chips, onPick, large }: { chips: string[]; onPick: (text: string) => void; large?: boolean }) {
  return (
    <div className={large ? "flex flex-wrap justify-center gap-2" : "flex flex-wrap gap-2"}>
      {chips.map((text) => {
        const meta = STARTER_PROMPTS.find((p) => p.text === text);
        const Icon = meta ? ICONS[meta.icon as keyof typeof ICONS] : undefined;
        return (
          <button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            className="inline-flex items-center gap-2 rounded-full border border-default bg-surface px-3.5 py-2 text-sm text-secondary transition hover:bg-surface-secondary hover:text-[color:var(--color-text)]"
          >
            {Icon ? <Icon className="size-4" /> : null}
            {text}
          </button>
        );
      })}
    </div>
  );
}
