import Image from 'next/image';

const MARK_RATIO = 128 / 269; // ancho / alto del PNG de la marca

// Tamaño intrínseco FIJO del PNG optimizado. Al mantenerlo constante, Next.js
// descarga el logo una sola vez: el cambio de tamaño al scrollear se hace solo
// por CSS y ya no dispara una nueva descarga (que causaba el parpadeo).
const INTRINSIC_HEIGHT = 68;
const INTRINSIC_WIDTH = Math.round(INTRINSIC_HEIGHT * MARK_RATIO);

export default function Logo({
  tone = 'navy',
  size = 34,
  className = '',
}: {
  tone?: 'navy' | 'cream';
  size?: number;
  className?: string;
}) {
  const src =
    tone === 'cream'
      ? '/brand/logo-mark-cream.png'
      : '/brand/logo-mark-navy.png';
  const color = tone === 'cream' ? 'text-cream' : 'text-ink';

  return (
    <span className={`flex items-end gap-2 ${color} ${className}`}>
      <Image
        src={src}
        alt=""
        width={INTRINSIC_WIDTH}
        height={INTRINSIC_HEIGHT}
        priority
        className="w-auto transition-[height] duration-300 ease-soft"
        style={{ height: size }}
      />
      <span
        className="font-script leading-none transition-[font-size,margin] duration-300 ease-soft"
        style={{ fontSize: size * 0.92, marginBottom: size * 0.04 }}
      >
        vientosur
      </span>
      <span className="sr-only">Viento Sur</span>
    </span>
  );
}
