import Image from 'next/image';

const MARK_RATIO = 128 / 269; // ancho / alto del PNG de la marca

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
  const width = Math.round(size * MARK_RATIO);

  return (
    <span className={`flex items-end gap-2 ${color} ${className}`}>
      <Image
        src={src}
        alt=""
        width={width}
        height={size}
        priority
        className="w-auto"
        style={{ height: size }}
      />
      <span
        className="font-script leading-none"
        style={{ fontSize: size * 0.92, marginBottom: size * 0.04 }}
      >
        vientosur
      </span>
      <span className="sr-only">Viento Sur</span>
    </span>
  );
}
