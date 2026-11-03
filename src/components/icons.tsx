type P = { size?: number };

const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const ChevronLeft = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}><path d="M15 18l-6-6 6-6" /></svg>
);
export const ChevronRight = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}><path d="M9 6l6 6-6 6" /></svg>
);
export const Close = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Check = ({ size = 14, width = 2.5 }: P & { width?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={width} {...base}><path d="M5 12l5 5 9-10" /></svg>
);

// Tab bar
export const PinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="2" {...base}><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="2" {...base}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
);
export const BubbleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="2" {...base}><path d="M4 5h16v11H9l-5 4z" /></svg>
);
export const NoteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="2" {...base}><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h6M9 14h6" /></svg>
);
