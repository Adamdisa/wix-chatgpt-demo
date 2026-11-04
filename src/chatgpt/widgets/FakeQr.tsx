/** Deterministic QR-looking pattern for mock tickets (not scannable). */
export function FakeQr({ seed, size = 96 }: { seed: string; size?: number }) {
  const n = 21;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967295;
  };
  const cells: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd() > 0.5));
  const finder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const edge = i === 0 || i === 6 || j === 0 || j === 6;
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        cells[r + i][c + j] = edge || core;
      }
    for (let i = -1; i < 8; i++)
      for (let j = -1; j < 8; j++) {
        const rr = r + i;
        const cc = c + j;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        if (i === -1 || i === 7 || j === -1 || j === 7) cells[rr][cc] = false;
      }
  };
  finder(0, 0);
  finder(0, n - 7);
  finder(n - 7, 0);
  const s = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Ticket QR code" className="rounded-md bg-white p-1">
      {cells.map((row, r) => row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c * s} y={r * s} width={s} height={s} fill="#0d0d0d" /> : null)))}
    </svg>
  );
}
