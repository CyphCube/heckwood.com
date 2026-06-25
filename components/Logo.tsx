export function Logo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Heckwood"
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] ${className}`}
    />
  );
}
