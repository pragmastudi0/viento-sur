import Image from 'next/image';

export default function Logo({
  tone = 'navy',
  size = 34,
  className = '',
}: {
  tone?: 'navy' | 'cream';
  size?: number;
  className?: string;
}) {
  return (
    <span className={`flex items-end gap-2 ${className}`}>
      <Image
        src={`/brand/logo-mark-${tone}.png`}
        alt=""
        width={452}
        height={962}
        priority
        className="w-auto transition-[height] duration-300 ease-soft"
        style={{ height: size }}
      />
      <Image
        src={`/brand/logo-wordmark-${tone}.png`}
        alt=""
        width={1013}
        height={225}
        priority
        className="w-auto transition-[height,margin] duration-300 ease-soft"
        style={{ height: size * 0.55, marginBottom: size * 0.04 }}
      />
      <span className="sr-only">Viento Sur</span>
    </span>
  );
}
