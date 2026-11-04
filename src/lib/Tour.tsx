import { X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface TourStep {
  /** CSS selector(s); the first one that resolves to a rendered element is used. */
  target: string | string[];
  title: string;
  body: ReactNode;
  cta?: string;
  onCta?: () => void;
  secondary?: string;
  placement?: "top" | "bottom";
}

const PAD = 8;
const CARD_W = 340;

function findTarget(target: string | string[]): HTMLElement | null {
  for (const sel of Array.isArray(target) ? target : [target]) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && el.getClientRects().length > 0) return el;
  }
  return null;
}

/**
 * Spotlight coachmarks. Dims the page, cuts a hole around the step's target and
 * anchors a card with a pointer to it. No persistence: callers decide when to show it.
 */
export function Tour({ steps, onFinish }: { steps: TourStep[]; onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[i];

  const next = useCallback(() => {
    if (i + 1 >= steps.length) onFinish();
    else {
      setRect(null);
      setI(i + 1);
    }
  }, [i, steps.length, onFinish]);

  // Resolve the target (it may render a moment later), scroll it into view, then measure.
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    let tries = 0;
    let el: HTMLElement | null = null;
    const measure = () => {
      if (!cancelled && el) setRect(el.getBoundingClientRect());
    };
    const tick = () => {
      if (cancelled) return;
      el = findTarget(step.target);
      if (!el) {
        if (++tries < 40) setTimeout(tick, 150);
        else next();
        return;
      }
      const r = el.getBoundingClientRect();
      const inView = r.top >= 0 && r.bottom <= window.innerHeight;
      if (!inView) el.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(measure, inView ? 50 : 450);
    };
    tick();
    // Layout keeps moving after mount (web fonts, images, animations), so keep measuring.
    const poll = window.setInterval(measure, 200);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFinish]);

  if (!step || !rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const hole = { left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const cardW = Math.min(CARD_W, vw - 32);
  const spaceBelow = vh - hole.top - hole.height;
  const below = step.placement ? step.placement === "bottom" : spaceBelow > 240;
  const cx = hole.left + hole.width / 2;
  const left = Math.min(Math.max(16, cx - cardW / 2), vw - cardW - 16);
  const arrowX = Math.min(Math.max(24, cx - left), cardW - 24);
  const gap = 18;
  const cardStyle = below ? { top: hole.top + hole.height + gap, left, width: cardW } : { bottom: vh - hole.top + gap, left, width: cardW };

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={step.title} style={{ fontFamily: "var(--font-sans, system-ui)" }}>
      {/* Backdrop with a cutout around the target. */}
      <div
        className="pointer-events-none absolute rounded-2xl transition-all duration-300 ease-out"
        style={{ ...hole, boxShadow: "0 0 0 9999px rgba(10,10,12,0.58)" }}
      />
      <div className="pointer-events-none absolute animate-pulse rounded-2xl ring-2 ring-white/80" style={hole} />

      <div className="absolute rounded-2xl bg-white p-5 text-[#0d0d0d] shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out" style={cardStyle}>
        <span
          className="absolute size-4 rotate-45 bg-white"
          style={below ? { top: -8, left: arrowX - 8 } : { bottom: -8, left: arrowX - 8 }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-black/45 uppercase">
            Demo guide · {i + 1} of {steps.length}
          </p>
          <button type="button" onClick={onFinish} aria-label="Skip guide" className="-mt-1 -mr-1 rounded-full p-1 text-black/45 hover:bg-black/5 hover:text-black">
            <X className="size-4" />
          </button>
        </div>
        <h3 className="mt-1.5 text-base font-semibold tracking-tight">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-black/65">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={onFinish} className="text-sm font-medium text-black/50 hover:text-black">
            {step.secondary ?? "Skip"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (step.onCta) {
                onFinish();
                step.onCta();
              } else next();
            }}
            className="rounded-full bg-[#0d0d0d] px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
          >
            {step.cta ?? (i + 1 >= steps.length ? "Got it" : "Next")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
