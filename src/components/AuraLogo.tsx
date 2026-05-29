interface AuraLogoProps {
  size?: number;
  fontSize?: number;
  className?: string;
}

export default function AuraLogo({ size = 28, fontSize = 24, className = "" }: AuraLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="13" stroke="#7c3aed" strokeWidth="2" />
        <circle cx="14" cy="14" r="5" fill="#7c3aed" />
      </svg>
      <span className="aura-logo" style={{ fontSize }}>
        aura<span className="aura-logo-dot">.</span>
      </span>
    </span>
  );
}