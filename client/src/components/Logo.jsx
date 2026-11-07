// Offerly mark: an open "O" ring with a check mark breaking out of it,
// i.e. an application that turned into an offer.
export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="offerly-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#offerly-g)" />
      <path d="M22 10 A8.5 8.5 0 1 0 24.5 16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M11.8 15.8 L15.2 19.2 L24.6 9.4" fill="none" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 32 }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word">Offer<span>ly</span></span>
    </span>
  );
}
