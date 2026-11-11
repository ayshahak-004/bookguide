export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.5" fill="currentColor" />
      <circle cx="17" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function BookSearchIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="80" r="70" fill="var(--color-cream-dark)" />
      <path
        d="M30 60c15-8 30-8 45 0v55c-15-8-30-8-45 0V60Z"
        fill="var(--color-coral)"
      />
      <path
        d="M120 60c-15-8-30-8-45 0v55c15-8 30-8 45 0V60Z"
        fill="var(--color-coral)"
        opacity="0.85"
      />
      <path
        d="M30 60c15-8 30-8 45 0M120 60c-15-8-30-8-45 0"
        stroke="var(--color-navy)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="104" cy="94" r="20" fill="none" stroke="var(--color-navy)" strokeWidth="5" />
      <path d="M119 109l14 14" stroke="var(--color-navy)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function StoreTile({
  label,
  color,
  size = 40,
}: {
  label: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-lg font-bold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {label.charAt(0)}
    </div>
  );
}
