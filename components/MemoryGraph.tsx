/**
 * Visuel « Memory Engine » : des souvenirs reliés entre chapitres.
 * SVG statique, décoratif. Le trait de liaison se dessine à l'entrée
 * (stroke-dashoffset), une seule fois, en CSS.
 */
const NODES = [
  { x: 60, y: 70, label: "Grand-mère", chapter: "Ch. 01", main: true },
  { x: 300, y: 50, label: "La ferme", chapter: "Ch. 01" },
  { x: 200, y: 170, label: "Sa cuisine", chapter: "Ch. 07", main: true },
  { x: 360, y: 210, label: "Le mariage", chapter: "Ch. 07" },
  { x: 90, y: 260, label: "Les dimanches", chapter: "Ch. 09" },
  { x: 250, y: 310, label: "La recette", chapter: "Ch. 11", main: true },
];

const LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [2, 3],
  [2, 4],
  [2, 5],
  [4, 5],
];

export default function MemoryGraph() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[440px]">
      <svg viewBox="0 0 420 360" className="h-auto w-full overflow-visible font-sans">
        <defs>
          <radialGradient id="mg-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,176,106,0.35)" />
            <stop offset="100%" stopColor="rgba(212,176,106,0)" />
          </radialGradient>
        </defs>
        <circle cx="210" cy="180" r="190" fill="url(#mg-halo)" />

        {LINKS.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="var(--loomina-gold)"
            strokeWidth={1.25}
            strokeDasharray="4 4"
            opacity={0.7}
          />
        ))}

        {NODES.map((n, i) => (
          <g key={i} transform={`translate(${n.x} ${n.y})`}>
            <circle r={n.main ? 22 : 16} fill="var(--paper)" stroke="var(--hairline-strong)" />
            <circle r={n.main ? 6 : 4} fill={n.main ? "var(--ink)" : "var(--loomina-gold)"} />
            <text y={n.main ? 42 : 34} textAnchor="middle" fontSize="13" fontWeight={600} fill="var(--ink)">
              {n.label}
            </text>
            <text y={n.main ? 58 : 50} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
              {n.chapter}
            </text>
          </g>
        ))}
      </svg>

      {/* Bulle explicative */}
      <div className="absolute -bottom-4 right-0 max-w-[230px] rounded-2xl bg-[var(--ink)] px-4 py-3 font-sans text-[13px] leading-snug text-[var(--loomina-void)] shadow-[0_20px_40px_-20px_rgba(26,24,21,0.5)]">
        <span className="text-[var(--loomina-gold-light)]">Loomina relie :</span> la cuisine du chapitre 7 renvoie à la grand-mère du chapitre 1.
      </div>
    </div>
  );
}
