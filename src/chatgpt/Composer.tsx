import { ArrowUp, AtSign, AudioLines, BookOpen, Bot, ChevronRight, Globe, ImagePlus, LayoutGrid, Mic, Paperclip, PenLine, Plus, Telescope, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { cn } from "../lib/cn";
import { WixMark } from "./WixMark";

const APPS = [
  { id: "booking", name: "Booking.com", color: "#003b95", initial: "B" },
  { id: "canva", name: "Canva", color: "#7d2ae8", initial: "C" },
  { id: "coursera", name: "Coursera", color: "#0056d2", initial: "C" },
  { id: "expedia", name: "Expedia", color: "#1f2a44", initial: "E" },
  { id: "figma", name: "Figma", color: "#f24e1e", initial: "F" },
  { id: "spotify", name: "Spotify", color: "#1db954", initial: "S" },
  { id: "wix", name: "Wix", color: "#000000", initial: "W" },
];

function AppIcon({ id, color, initial, size = 20 }: { id: string; color: string; initial: string; size?: number }) {
  if (id === "wix") return <WixMark size={size} />;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white" style={{ width: size, height: size, background: color }} aria-hidden>
      {initial}
    </span>
  );
}

export function Composer({
  onSend,
  disabled,
  connected,
  autoFocus,
  initialValue,
  size = "md",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  connected?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
  size?: "md" | "lg";
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [mention, setMention] = useState<string | null>(initialValue?.startsWith("@Wix") ? "Wix" : null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValue?.startsWith("@Wix")) setValue(initialValue.replace(/^@Wix\s*/, ""));
  }, [initialValue]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setAppsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const submit = () => {
    const text = `${mention ? `@${mention} ` : ""}${value}`.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    setMention(null);
    setMentionQuery(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && (e.key === "Enter" || e.key === "Tab")) {
      const match = APPS.find((a) => a.name.toLowerCase().startsWith(mentionQuery.toLowerCase()));
      if (match) {
        e.preventDefault();
        pickMention(match.name);
        return;
      }
    }
    if (e.key === "Escape") setMentionQuery(null);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Backspace" && value === "" && mention) setMention(null);
  };

  const onChange = (next: string) => {
    setValue(next);
    const m = next.match(/(?:^|\s)@([a-z]*)$/i);
    setMentionQuery(m ? m[1] : null);
  };

  const pickMention = (name: string) => {
    setMention(name);
    setValue((v) => v.replace(/(?:^|\s)@[a-z]*$/i, "").trimStart());
    setMentionQuery(null);
    setMenuOpen(false);
    setAppsOpen(false);
    textareaRef.current?.focus();
  };

  const hasText = value.trim().length > 0 || !!mention;
  const filteredApps = mentionQuery !== null ? APPS.filter((a) => a.name.toLowerCase().startsWith(mentionQuery.toLowerCase())) : [];

  return (
    <div ref={rootRef} className="relative w-full">
      {/* @-mention popover */}
      {mentionQuery !== null && filteredApps.length > 0 && (
        <div className="absolute bottom-full left-3 z-40 mb-2 w-64 overflow-hidden rounded-2xl border border-default bg-surface-elevated p-1.5 shadow-lg">
          <div className="px-2 py-1 text-xs text-tertiary">Apps</div>
          {filteredApps.map((a) => (
            <button key={a.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pickMention(a.name)} className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-secondary">
              <AppIcon {...a} />
              <span className="flex-1">{a.name}</span>
              {a.id === "wix" && connected ? <span className="text-xs text-tertiary">Connected</span> : null}
            </button>
          ))}
        </div>
      )}

      {/* + menu */}
      {menuOpen && (
        <div className="absolute bottom-full left-0 z-40 mb-2 flex items-end gap-1">
          <div className="w-64 rounded-2xl border border-default bg-surface-elevated p-1.5 shadow-lg">
            {[
              { icon: Paperclip, label: "Add photos & files" },
              { icon: ImagePlus, label: "Create image" },
              { icon: Telescope, label: "Deep research" },
              { icon: Bot, label: "Agent mode" },
              { icon: BookOpen, label: "Study and learn" },
              { icon: Globe, label: "Web search" },
              { icon: PenLine, label: "Canvas" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} type="button" className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-surface-secondary" onClick={() => setMenuOpen(false)}>
                <Icon className="size-[18px] text-secondary" />
                {label}
              </button>
            ))}
            <div className="my-1 border-t border-subtle" />
            <button
              type="button"
              onMouseEnter={() => setAppsOpen(true)}
              onClick={() => setAppsOpen((v) => !v)}
              className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-surface-secondary", appsOpen && "bg-surface-secondary")}
            >
              <LayoutGrid className="size-[18px] text-secondary" />
              <span className="flex-1">Apps</span>
              <ChevronRight className="size-4 text-tertiary" />
            </button>
          </div>
          {appsOpen && (
            <div className="w-60 rounded-2xl border border-default bg-surface-elevated p-1.5 shadow-lg">
              {APPS.map((a) => (
                <button key={a.id} type="button" onClick={() => pickMention(a.name)} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-surface-secondary">
                  <AppIcon {...a} />
                  <span className="flex-1">{a.name}</span>
                  {a.id === "wix" && connected ? <span className="text-xs text-tertiary">Connected</span> : null}
                </button>
              ))}
              <div className="my-1 border-t border-subtle" />
              <button type="button" className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-secondary hover:bg-surface-secondary">
                <AtSign className="size-[18px]" /> Browse apps
              </button>
            </div>
          )}
        </div>
      )}

      <div className={cn("flex w-full flex-col rounded-[28px] border border-default bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition focus-within:border-strong", size === "lg" ? "px-3 py-2.5" : "px-3 py-2")}>
        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label="Add"
            onClick={() => {
              setMenuOpen((v) => !v);
              setAppsOpen(false);
            }}
            className={cn("mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-secondary transition hover:bg-surface-secondary", menuOpen && "bg-surface-secondary")}
          >
            <Plus className="size-5" />
          </button>

          {mention ? (
            <span className="mb-1.5 inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-surface-tertiary pr-1 pl-1.5 text-sm font-medium">
              <AppIcon id={mention.toLowerCase()} color="#000" initial={mention[0]} size={18} />
              {mention}
              <button type="button" onClick={() => setMention(null)} aria-label={`Remove ${mention}`} className="inline-flex size-5 items-center justify-center rounded-full hover:bg-surface-secondary">
                <X className="size-3" />
              </button>
            </span>
          ) : null}

          <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={mention ? `Ask ${mention}…` : "Ask anything"}
            className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-tertiary disabled:opacity-60"
          />

          <div className="mb-0.5 flex shrink-0 items-center gap-1">
            {!hasText && (
              <button type="button" aria-label="Dictate" className="inline-flex size-9 items-center justify-center rounded-full text-secondary hover:bg-surface-secondary">
                <Mic className="size-5" />
              </button>
            )}
            {hasText ? (
              <button type="button" onClick={submit} disabled={disabled} aria-label="Send" className="inline-flex size-9 items-center justify-center rounded-full bg-primary-solid text-primary-solid transition disabled:opacity-30">
                <ArrowUp className="size-5" strokeWidth={2.4} />
              </button>
            ) : (
              <button type="button" aria-label="Voice mode" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-solid px-3 text-sm font-medium text-primary-solid">
                <AudioLines className="size-4" />
                Voice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
