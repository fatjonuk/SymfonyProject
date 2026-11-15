export function Logo({ light = true, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <rect x="1" y="1" width="38" height="38" rx="11" fill={light ? "#F2B705" : "#0D1B3D"} />
        <path d="M22.5 7 11 22.5h8L17.5 33 29 17.5h-8L22.5 7Z" fill={light ? "#0D1B3D" : "#F2B705"} />
      </svg>
      <span className="leading-none">
        <span className={`block text-[0.95rem] font-extrabold tracking-[0.14em] ${light ? "text-white" : "text-night"}`}>UGB</span>
        <span className={`block text-[0.62rem] font-semibold uppercase tracking-[0.32em] ${light ? "text-white/60" : "text-night/60"}`}>
          Électricité
        </span>
      </span>
    </span>
  );
}
