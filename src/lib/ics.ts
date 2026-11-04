/** Builds and downloads a one-event .ics file (what "Add to calendar" does in the demo). */
export function downloadIcs(opts: { title: string; dateISO: string; time: string; minutes?: number; location?: string; description?: string }) {
  const [h, m] = opts.time.split(":").map(Number);
  const start = new Date(`${opts.dateISO}T00:00:00`);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + (opts.minutes ?? 120) * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wix//ChatGPT demo//EN",
    "BEGIN:VEVENT",
    `UID:${Math.random().toString(36).slice(2)}@wix-chatgpt-demo`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    opts.location ? `LOCATION:${esc(opts.location)}` : "",
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
