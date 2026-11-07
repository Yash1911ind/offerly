// Coloured initial badge for a company; the colour is derived from the name so it stays consistent
const PALETTE = [
  ['#dbeafe', '#1d4ed8'],
  ['#dcfce7', '#15803d'],
  ['#fef3c7', '#b45309'],
  ['#fce7f3', '#be185d'],
  ['#ede9fe', '#6d28d9'],
  ['#cffafe', '#0e7490'],
  ['#ffe4e6', '#be123c'],
  ['#e0e7ff', '#4338ca'],
];

export default function CompanyAvatar({ name = '?', size = 44 }) {
  const hash = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const [bg, fg] = PALETTE[hash % PALETTE.length];
  return (
    <span
      className="company-avatar"
      aria-hidden="true"
      style={{ background: bg, color: fg, width: size, height: size, fontSize: size * 0.42, borderRadius: size * 0.26 }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}
