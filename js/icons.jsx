// icons.jsx — small inline icons. Stroke-only, currentColor.

const Ic = {
  drop: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 3.5c-3 4-6 7.2-6 11a6 6 0 0012 0c0-3.8-3-7-6-11z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  syringe: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M14 4l6 6M16 6l-9 9-3 4 4-3 9-9M9 14l3 3"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  home: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  list: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 9h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  share: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 4v12M8 8l4-4 4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevR: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevL: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  x: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  check: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  upload: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 16V4M7 9l5-5 5 5M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  spark: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M19 4v3M19 16v3M5 19v2M3 6h2"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  arrowUp: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowDown: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowFlat: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 12h14M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  pencil: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 20h4l11-11-4-4L4 16v4zM13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

window.Ic = Ic;
