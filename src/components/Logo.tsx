export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span
        className="brand-gradient grid place-items-center rounded-xl text-white shadow-lg shadow-brand/25"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 20V6l8 8 8-8v14" />
        </svg>
      </span>
      <span className="text-lg">
        Nexora<span className="brand-text"> AI</span>
      </span>
    </span>
  );
}
