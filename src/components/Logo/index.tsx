type TProps = {
  className?: string;
  animated?: boolean;
};

// Font-size of the root sets the logo scale (43.2px = 150px wide).
// The animated SVG loops on its own and falls back to the static logo for reduced motion.
export const Logo = ({ className = "", animated = false }: TProps) => {
  return (
    <span
      className={`relative inline-block h-[1.2302em] w-[3.4718em] shrink-0 leading-none ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={animated ? "/logo-animated.svg" : "/logo.svg"}
        width={889}
        height={315}
        alt="2easy"
        decoding="async"
        className="block size-full"
      />
    </span>
  );
};
