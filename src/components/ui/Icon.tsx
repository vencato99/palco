import type { SVGProps } from 'react';

/** Ícones de traço em um só lugar: tree-shaking natural e nenhuma lib extra. */
const PATHS = {
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
  filter: 'M4 6h16M7 12h10M10 18h4',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  users: 'M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 20v-1a4 4 0 00-3-3.9M16 4.1a3.5 3.5 0 010 6.8',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5 9-10',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z',
  share: 'M12 3v12M7 8l5-5 5 5M5 14v6h14v-6',
  route: 'M6 16a2 2 0 100 4 2 2 0 000-4zM18 4a2 2 0 100 4 2 2 0 000-4zM8 18h6a4 4 0 000-8h-4a4 4 0 010-8h6',
  home: 'M3 11l9-7 9 7M5 10v10h14V10',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  shield: 'M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6zM9 12l2 2 4-4',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  stage: 'M3 14h18v6H3zM5 14V8l7-4 7 4v6',
  /* comodidades */
  bar: 'M6 3h12l-6 8zM12 11v8M8 21h8',
  chair: 'M6 4v8h12V4M5 12h14v4H5zM7 16v4M17 16v4',
  sound: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M19 6a8 8 0 010 12',
  light: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z',
  parking: 'M5 3h14v18H5zM10 17V7h3a3 3 0 010 6h-3',
  access: 'M12 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 9h10M12 9v5l-3 6M12 14l3 6',
  air: 'M12 2v20M4 7l16 10M20 7L4 17',
  truck: 'M2 7h11v9H2zM13 10h4l3 3v3h-7M6 17a2 2 0 100 4 2 2 0 000-4zM17 17a2 2 0 100 4 2 2 0 000-4z',
  power: 'M13 2L4 14h7l-1 8 9-12h-7z',
  wifi: 'M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01',
  ticket: 'M3 7h18v4a2 2 0 000 4v4H3v-4a2 2 0 000-4zM10 7v12',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}
