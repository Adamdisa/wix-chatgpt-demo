import { ArrowUp, CalendarPlus, Check, MousePointer2, Navigation, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { BARBERS, EVENTS } from "../data/catalog";
import { WixMark } from "../chatgpt/WixMark";
import { BarbersCarousel } from "../chatgpt/widgets/BarberWidgets";
import { EventsCarousel } from "../chatgpt/widgets/EventWidgets";
import { FakeQr } from "../chatgpt/widgets/FakeQr";
import { cn } from "../lib/cn";

interface Scene {
  id: "barber" | "events";
  prompt: string;
  status: string;
  text: string;
  widget: ReactNode;
  pick: string;
  status2: string;
  text2: string;
  rows: [string, string][];
  cta: string;
  confirm: string;
  status3: string;
  text3: string;
  done: { title: string; meta: string; actions: [ReactNode, ReactNode]; qr?: boolean };
}

const SCENES: Scene[] = [
  {
    id: "barber",
    prompt: "Book me a haircut in Tel Aviv tomorrow afternoon",
    status: "Searched Wix",
    text: "Four barbers near you have openings tomorrow afternoon. Oren's has the highest rating and a 15:30 slot.",
    widget: <BarbersCarousel ids={BARBERS.slice(0, 3).map((b) => b.id)} onAct={() => {}} />,
    pick: "Book at Oren's Barber Shop",
    status2: "Checked availability at Oren's",
    text2: "Classic cut with Dana tomorrow at 15:30 is open. Want me to book it?",
    rows: [
      ["Service", "Classic cut · 30 min"],
      ["When", "Thu, Nov 5 · 15:30"],
      ["With", "Dana"],
      ["Total", "₪90"],
    ],
    cta: "Confirm booking",
    confirm: "Confirm booking",
    status3: "Booked with Wix",
    text3: "You're booked. Oren's sent a confirmation to your email.",
    done: {
      title: "Classic cut at Oren's Barber Shop",
      meta: "Thu, Nov 5 · 15:30 · Dana",
      actions: [
        <>
          <CalendarPlus className="size-3.5" /> Add to calendar
        </>,
        <>
          <Navigation className="size-3.5" /> Directions
        </>,
      ],
    },
  },
  {
    id: "events",
    prompt: "What's happening in Tel Aviv this weekend?",
    status: "Searched Wix",
    text: "Here's what's on Thursday to Saturday, from venues and organizers listed on Wix.",
    widget: <EventsCarousel ids={EVENTS.slice(0, 4).map((e) => e.id)} onAct={() => {}} />,
    pick: "Tickets for Arctic Monkeys",
    status2: "Checked availability",
    text2: "Golden ring is almost sold out. Two tickets come to ₪1,449 including fees.",
    rows: [
      ["Event", "Arctic Monkeys — Live in Tel Aviv"],
      ["When", "Sat, Nov 7 · 20:00 · Yarkon Park"],
      ["Tickets", "2 × Golden ring"],
      ["Total", "₪1,449"],
    ],
    cta: "Pay with Apple Pay",
    confirm: "Pay ₪1,449 with Apple Pay",
    status3: "Purchased with Wix",
    text3: "Done. Your two tickets are in your email and ready for Apple Wallet.",
    done: {
      title: "2 tickets · Arctic Monkeys",
      meta: "Sat, Nov 7 · 20:00 · Golden ring",
      qr: true,
      actions: [
        <>
          <Wallet className="size-3.5" /> Add to Wallet
        </>,
        <>
          <CalendarPlus className="size-3.5" /> Add to calendar
        </>,
      ],
    },
  },
];

/**
 * Phase timeline per scene:
 * 0 typing · 1 sent · 2 searching · 3 results · 4 cursor to a card · 5 picked
 * 6 summary card · 7 cursor to confirm · 8 confirmed (status) · 9 receipt
 */
const TYPE_MS = 32;
const STEPS: [phase: number, afterMs: number][] = [
  [1, 500],
  [2, 500],
  [3, 1300],
  [4, 1900],
  [5, 1100],
  [6, 1300],
  [7, 1900],
  [8, 1000],
  [9, 1300],
];
const HOLD_MS = 4200;

function StatusLine({ live, label }: { live: boolean; label: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-black/55">
      <WixMark size={18} />
      <span className={live ? "shimmer-text font-medium" : ""}>{live ? `${label.replace(/^(Searched|Checked|Booked|Purchased)/, (m) => ({ Searched: "Searching", Checked: "Checking", Booked: "Booking", Purchased: "Purchasing" })[m] ?? m)}…` : label}</span>
      {!live ? <Check className="size-3.5" /> : null}
    </motion.div>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <div className="max-w-[80%] rounded-3xl bg-[#f3f3f3] px-4 py-2 text-sm leading-6">{children}</div>
    </motion.div>
  );
}

function WixRow() {
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <WixMark size={18} /> Wix
    </div>
  );
}

/** A small, auto-playing ChatGPT window used on the landing page. */
export function ChatPreview({ className, scene, autoplay = true }: { className?: string; scene?: "barber" | "events"; autoplay?: boolean; compact?: boolean }) {
  const [index, setIndex] = useState(scene === "events" ? 1 : 0);
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState("");
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const s = SCENES[index];

  useEffect(() => {
    if (scene) setIndex(scene === "events" ? 1 : 0);
  }, [scene]);

  // Drive the timeline: type the prompt, then step through the phases.
  useEffect(() => {
    setPhase(0);
    setTyped("");
    const timers: number[] = [];
    let i = 0;
    const typeTimer = window.setInterval(() => {
      i += 1;
      setTyped(s.prompt.slice(0, i));
      if (i >= s.prompt.length) {
        window.clearInterval(typeTimer);
        let at = 0;
        for (const [p, after] of STEPS) {
          at += after;
          timers.push(window.setTimeout(() => setPhase(p), at));
        }
        if (autoplay && !scene) timers.push(window.setTimeout(() => setIndex((x) => (x + 1) % SCENES.length), at + HOLD_MS));
      }
    }, TYPE_MS);
    return () => {
      window.clearInterval(typeTimer);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [index, autoplay, scene, s.prompt]);

  // Keep the newest message in view inside the fixed-height area.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const t = window.setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 80);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Fake pointer: fly to the first card's CTA (phase 4) and to the summary card's CTA (phase 7).
  useEffect(() => {
    const area = areaRef.current;
    const target = phase === 4 ? widgetRef.current?.querySelector("button") : phase === 7 ? ctaRef.current : null;
    if (!area || !target) {
      setCursor(null);
      return;
    }
    const t = window.setTimeout(() => {
      const b = target.getBoundingClientRect();
      const a = area.getBoundingClientRect();
      setCursor({ x: b.left - a.left + b.width * 0.55, y: b.top - a.top + b.height * 0.6 });
    }, 500);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div data-theme="light" className={cn("min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0d0d0d] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]", className)} style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex h-10 items-center gap-2 border-b border-black/5 px-4">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-medium text-black/50">ChatGPT 5.2</span>
      </div>

      <div className="relative">
        <div ref={areaRef} className="h-[560px] overflow-hidden px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
              {phase === 0 ? (
                <div className="flex h-[480px] items-center justify-center">
                  <p className="text-center text-xl font-medium tracking-tight text-black/80">What's on your mind today?</p>
                </div>
              ) : null}
              {phase >= 1 ? <UserBubble>{s.prompt}</UserBubble> : null}
              {phase >= 2 ? <StatusLine live={phase === 2} label={s.status} /> : null}
              {phase >= 3 ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-sm leading-6">{s.text}</p>
                  <WixRow />
                  <div ref={widgetRef} className="pointer-events-none min-w-0 overflow-hidden">
                    {s.widget}
                  </div>
                </motion.div>
              ) : null}
              {phase >= 5 ? <UserBubble>{s.pick}</UserBubble> : null}
              {phase >= 5 ? <StatusLine live={phase === 5} label={s.status2} /> : null}
              {phase >= 6 ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-sm leading-6">{s.text2}</p>
                  <WixRow />
                  <div className="max-w-[420px] rounded-2xl border border-black/10">
                    <dl className="divide-y divide-black/5 text-sm">
                      {s.rows.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                          <dt className="text-black/50">{k}</dt>
                          <dd className={cn("text-right", k === "Total" && "font-semibold")}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="border-t border-black/5 p-3">
                      <button
                        ref={ctaRef}
                        type="button"
                        tabIndex={-1}
                        className={cn("flex h-10 w-full items-center justify-center rounded-full bg-[#0d0d0d] text-sm font-medium text-white transition", phase >= 8 && "bg-black/25")}
                      >
                        {phase >= 8 ? <Check className="size-4" /> : s.cta}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
              {phase >= 8 ? <UserBubble>{s.confirm}</UserBubble> : null}
              {phase >= 8 ? <StatusLine live={phase === 8} label={s.status3} /> : null}
              {phase >= 9 ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pb-2">
                  <p className="text-sm leading-6">{s.text3}</p>
                  <WixRow />
                  <div className="max-w-[420px] rounded-2xl border border-black/10">
                    <div className="flex items-start gap-3 p-4">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{s.done.title}</div>
                        <div className="text-sm text-black/55">{s.done.meta}</div>
                      </div>
                      {s.done.qr ? (
                        <span className="rounded-lg border border-black/10 p-1">
                          <FakeQr seed={s.id} size={44} />
                        </span>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-black/5 p-3">
                      {s.done.actions.map((a, i) => (
                        <span key={i} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-xs font-medium", i === 0 ? "bg-[#0d0d0d] text-white" : "border border-black/15")}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {cursor ? (
            <motion.div
              key={`${s.id}-${phase}`}
              className="pointer-events-none absolute z-10"
              initial={{ x: cursor.x + 140, y: cursor.y + 90, opacity: 0 }}
              animate={{ x: cursor.x, y: cursor.y, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={{ left: 0, top: 0 }}
            >
              <motion.span className="absolute -top-3 -left-3 block size-6 rounded-full bg-black/15" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.6], opacity: [0.6, 0] }} transition={{ delay: 0.55, duration: 0.5 }} />
              <MousePointer2 className="size-5 fill-black text-white drop-shadow" strokeWidth={1.5} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="border-t border-black/5 px-5 py-3">
        <div className="flex h-11 items-center gap-2 rounded-full border border-black/10 px-4 text-sm">
          <span className={cn("min-w-0 flex-1 truncate", typed && phase === 0 ? "text-[#0d0d0d]" : "text-black/40")}>
            {phase === 0 && typed ? (
              <>
                {typed}
                <span className="ml-px inline-block h-4 w-px animate-pulse bg-black align-middle" />
              </>
            ) : (
              "Ask anything"
            )}
          </span>
          <span className={cn("inline-flex size-7 items-center justify-center rounded-full transition", typed && phase === 0 ? "bg-[#0d0d0d] text-white" : "bg-black/10 text-black/40")}>
            <ArrowUp className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
