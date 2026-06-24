export function Logo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const inner = Math.round(size * 0.84);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] bg-cream ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Heckwood" width={inner} height={inner} />
    </span>
  );
}
