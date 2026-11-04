import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { BARBERS, EVENTS } from "../data/catalog";
import { WixMark } from "../chatgpt/WixMark";
import { BarbersCarousel } from "../chatgpt/widgets/BarberWidgets";
import { EventsCarousel } from "../chatgpt/widgets/EventWidgets";
import { cn } from "../lib/cn";

const SCENES = [
  {
    id: "barber",
    user: "Book me a haircut in Tel Aviv tomorrow afternoon",
    status: "Searched Wix",
    text: "Four barbers near you have openings tomorrow afternoon. Oren's has the highest rating and a 15:30 slot.",
    widget: <BarbersCarousel ids={BARBERS.slice(0, 3).map((b) => b.id)} onAct={() => {}} />,
  },
  {
    id: "events",
    user: "What's happening in Tel Aviv this weekend?",
    status: "Searched Wix",
    text: "Here's what's on Thursday to Saturday, from venues and organizers listed on Wix.",
    widget: <EventsCarousel ids={EVENTS.slice(0, 4).map((e) => e.id)} onAct={() => {}} />,
  },
];

/** A small, auto-playing ChatGPT window used on the landing page. */
export function ChatPreview({ className, scene, autoplay = true, compact }: { className?: string; scene?: "barber" | "events"; autoplay?: boolean; compact?: boolean }) {
  const [index, setIndex] = useState(scene === "events" ? 1 : 0);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (scene) setIndex(scene === "events" ? 1 : 0);
  }, [scene]);

  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1900);
    const t3 = autoplay && !scene ? setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), 8000) : undefined;
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [index, autoplay, scene]);

  const s = SCENES[index];

  return (
    <div data-theme="light" className={cn("min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white text-[#0d0d0d] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]", className)} style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex h-10 items-center gap-2 border-b border-black/5 px-4">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-medium text-black/50">ChatGPT 5.2</span>
      </div>
      <div className={cn("space-y-4 overflow-hidden px-5 py-5", "h-[560px]")}>
        <AnimatePresence mode="wait">
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-3xl bg-[#f3f3f3] px-4 py-2 text-sm leading-6">{s.user}</div>
            </div>
            {phase >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-black/55">
                <WixMark size={18} />
                <span className={phase === 1 ? "shimmer-text font-medium" : ""}>{phase === 1 ? "Searching Wix…" : s.status}</span>
              </motion.div>
            )}
            {phase >= 2 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="text-sm leading-6">{s.text}</p>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <WixMark size={18} /> Wix
                </div>
                <div className="pointer-events-none min-w-0 overflow-hidden">{s.widget}</div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="border-t border-black/5 px-5 py-3">
        <div className="flex h-11 items-center rounded-full border border-black/10 px-4 text-sm text-black/40">Ask anything</div>
      </div>
    </div>
  );
}
