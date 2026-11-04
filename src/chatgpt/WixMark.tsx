import { cn } from "../lib/cn";

/** Wix app icon as ChatGPT would render it next to the app name. */
export function WixMark({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-black text-white ring-1 ring-[color:var(--color-border-strong)]", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <WixLogo className="h-auto" style={{ width: size * 0.78 }} />
    </span>
  );
}

/** Wordmark for the landing page. */
export function WixLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 48" className={className} style={style} fill="currentColor" aria-label="Wix">
      <path d="M8 10h7.5l7.8 23.2L31.2 10h6.6l7.9 23.2L53.4 10H61L49.9 42h-7.1l-8-23.4L26.8 42h-7.1L8 10z" />
      <circle cx="69" cy="13" r="4" />
      <path d="M65.5 19.5h7V42h-7z" />
      <path d="M82 19.5l6.4 9.4 6.4-9.4H103l-10.3 11 11 11.5h-8.4l-7-9-7 9H73l11-11.5-10.3-11H82z" />
    </svg>
  );
}
