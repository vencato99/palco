import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Palco — início">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="#E5533A" />
        <path d="M9 22 L16 9 L23 22 Z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-2xl font-extrabold tracking-tight">palco</span>
    </Link>
  );
}
