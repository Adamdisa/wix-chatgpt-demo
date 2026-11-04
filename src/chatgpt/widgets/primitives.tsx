import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, Star } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

import { cn } from "../../lib/cn";

export { Button };

/* Apps SDK rule: brand colour only on accents; text, icons and dividers stay system. */

export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("widget-frame w-full max-w-[640px]", className)}>{children}</div>;
}

export function Meta({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-sm text-secondary", className)}>
      {icon ? <span className="inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </div>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="size-3.5 fill-current" aria-hidden />
      <span className="font-medium">{value.toFixed(1)}</span>
      {count ? <span className="text-tertiary">({count.toLocaleString()})</span> : null}
    </span>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-surface-tertiary text-secondary",
        tone === "success" && "bg-success-soft text-success",
        tone === "warning" && "bg-warning-soft text-warning",
      )}
    >
      {children}
    </span>
  );
}

export function Chip({ selected, children, onClick, disabled, className }: { selected?: boolean; children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full border px-3.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-35",
        selected ? "border-transparent bg-primary-solid text-primary-solid" : "border-default bg-surface hover:bg-surface-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Stepper({ value, min = 1, max = 10, onChange, label }: { value: number; min?: number; max?: number; onChange: (v: number) => void; label?: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-default p-0.5" role="group" aria-label={label}>
      <button type="button" className="inline-flex size-8 items-center justify-center rounded-full hover:bg-surface-secondary disabled:opacity-30" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Decrease">
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
      <button type="button" className="inline-flex size-8 items-center justify-center rounded-full hover:bg-surface-secondary disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function CheckRow({ checked, onToggle, title, meta, trailing }: { checked: boolean; onToggle: () => void; title: string; meta?: string; trailing?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition", checked ? "border-strong bg-surface-secondary" : "border-default hover:bg-surface-secondary")}
    >
      <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-md border", checked ? "border-transparent bg-primary-solid text-primary-solid" : "border-strong")}>
        {checked ? <Check className="size-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {meta ? <span className="block text-xs text-secondary">{meta}</span> : null}
      </span>
      {trailing ? <span className="shrink-0 text-sm tabular-nums">{trailing}</span> : null}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-secondary">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-xl border border-default bg-surface px-3 text-sm outline-none transition placeholder:text-tertiary focus:border-strong focus:ring-2 focus:ring-[color:var(--color-ring)]/20";

/* -------------------------------------------------------- carousel */

export function Carousel({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<{ start: boolean; end: boolean }>({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  return (
    <div className="group/carousel relative w-full">
      <div ref={ref} onScroll={update} role="list" aria-label={ariaLabel} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1">
        {children}
      </div>
      {!edge.start && (
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous" className="absolute top-[72px] left-1 hidden size-8 items-center justify-center rounded-full border border-default bg-surface shadow-md md:group-hover/carousel:inline-flex">
          <ChevronLeft className="size-4" />
        </button>
      )}
      {!edge.end && (
        <button type="button" onClick={() => scrollBy(1)} aria-label="Next" className="absolute top-[72px] right-1 hidden size-8 items-center justify-center rounded-full border border-default bg-surface shadow-md md:group-hover/carousel:inline-flex">
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}

export function CarouselCard({ image, alt, badge, title, lines, cta, onCta, onOpen }: { image: string; alt: string; badge?: ReactNode; title: string; lines: ReactNode[]; cta: string; onCta: () => void; onOpen?: () => void }) {
  return (
    <article role="listitem" className="widget-frame flex w-[224px] shrink-0 snap-start flex-col">
      <button type="button" onClick={onOpen ?? onCta} className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-tertiary text-left">
        <img src={image} alt={alt} className="size-full object-cover transition duration-300 hover:scale-[1.03]" loading="lazy" />
        {badge ? <span className="absolute top-2 left-2">{badge}</span> : null}
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{title}</h3>
        {lines.slice(0, 3).map((l, i) => (
          <div key={i} className="line-clamp-1 text-xs text-secondary">
            {l}
          </div>
        ))}
        <div className="mt-auto pt-2">
          <Button color="primary" size="sm" block onClick={onCta}>
            {cta}
          </Button>
        </div>
      </div>
    </article>
  );
}
