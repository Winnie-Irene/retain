interface OrnamentProps {
  size?: number;
  className?: string;
}

export function Moon({ size = 40, className }: OrnamentProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M30 6a18 18 0 1 0 12 29A15 15 0 0 1 30 6z" fill="var(--slate)" />
      <path d="M33 10a15 15 0 0 0-5 26 14 14 0 0 1 5-26z" fill="var(--blush-soft)" opacity="0.35" />
      <circle cx="18" cy="30" r="1.6" fill="var(--blush-soft)" opacity="0.6" />
    </svg>
  );
}

export function Sun({ size = 64, className }: OrnamentProps) {
  const rays = Array.from({ length: 24 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 24;
    const inner = index % 2 === 0 ? 19 : 21;
    const outer = index % 2 === 0 ? 30 : 26;
    return {
      x1: 32 + Math.cos(angle) * inner,
      y1: 32 + Math.sin(angle) * inner,
      x2: 32 + Math.cos(angle) * outer,
      y2: 32 + Math.sin(angle) * outer,
    };
  });

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g stroke="var(--terracotta)" strokeWidth="1.1" strokeLinecap="round">
        {rays.map((ray, index) => (
          <line key={index} {...ray} />
        ))}
      </g>
      <circle cx="32" cy="32" r="14" fill="var(--terracotta)" />
    </svg>
  );
}

export function Sprig({ size = 80, className, flip = false }: OrnamentProps & { flip?: boolean }) {
  const leaves = [
    { y: 18, side: -1, len: 13 },
    { y: 26, side: 1, len: 14 },
    { y: 34, side: -1, len: 15 },
    { y: 42, side: 1, len: 15 },
    { y: 50, side: -1, len: 14 },
    { y: 58, side: 1, len: 12 },
  ];

  return (
    <svg
      className={className}
      width={size * 0.55}
      height={size}
      viewBox="0 0 44 80"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M22 78 C 21 58, 22 34, 26 8" stroke="var(--slate)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {leaves.map((leaf) => {
        const baseX = 22 + (leaf.y < 40 ? 2 : 0);
        const tipX = baseX + leaf.side * leaf.len;
        const tipY = leaf.y - 8;
        return (
          <path
            key={leaf.y}
            d={`M${baseX} ${leaf.y} Q ${baseX + leaf.side * leaf.len * 0.6} ${leaf.y - 1} ${tipX} ${tipY} Q ${baseX + leaf.side * leaf.len * 0.3} ${tipY + 1} ${baseX} ${leaf.y}`}
            fill="var(--slate)"
            opacity="0.85"
          />
        );
      })}
      <path d="M26 8 Q 30 2 27 0 Q 24 4 26 8" fill="var(--slate)" opacity="0.85" />
    </svg>
  );
}

export function BrushStroke({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M6 22 C 40 8, 120 14, 190 10 S 330 4, 394 16 C 398 34, 392 58, 396 76 C 330 84, 250 80, 180 84 S 50 86, 4 78 C 8 60, 2 40, 6 22 Z"
        fill="var(--blush)"
        opacity="0.92"
      />
      <path d="M14 30 C 90 24, 200 28, 384 22" stroke="var(--paper)" strokeWidth="1.2" opacity="0.4" fill="none" />
      <path
        d="M10 68 C 120 74, 260 66, 390 70"
        stroke="var(--blush-deep)"
        strokeWidth="1.4"
        opacity="0.35"
        fill="none"
      />
    </svg>
  );
}