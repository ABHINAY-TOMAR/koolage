export type SlideLayout = 'title' | 'content' | 'two-col' | 'quote' | 'image-text' | 'blank';
export type SlideStyle = 'professional' | 'creative' | 'academic' | 'minimal' | 'bold';

export interface SlideBullet {
  id: string;
  text: string;
  level: number; // 0 = main, 1 = sub
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  bullets: SlideBullet[];
  notes: string;
  layout: SlideLayout;
  themeId: string;
  imageUrl?: string;
  quoteText?: string;
  quoteAuthor?: string;
  leftContent?: string;
  rightContent?: string;
}

export interface SlideTheme {
  id: string;
  name: string;
  emoji: string;
  bg: string;        // CSS background
  titleColor: string;
  bodyColor: string;
  accentColor: string;
  accentHex: string;
  cardBg: string;
  bulletDot: string;
}

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    titleColor: '#f8fafc',
    bodyColor: '#cbd5e1',
    accentColor: '#3b82f6',
    accentHex: '#3b82f6',
    cardBg: 'rgba(255,255,255,0.06)',
    bulletDot: '#3b82f6',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    emoji: '🌊',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)',
    titleColor: '#f0f9ff',
    bodyColor: '#bae6fd',
    accentColor: '#38bdf8',
    accentHex: '#38bdf8',
    cardBg: 'rgba(255,255,255,0.12)',
    bulletDot: '#7dd3fc',
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌿',
    bg: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)',
    titleColor: '#f0fdf4',
    bodyColor: '#bbf7d0',
    accentColor: '#22c55e',
    accentHex: '#22c55e',
    cardBg: 'rgba(255,255,255,0.08)',
    bulletDot: '#4ade80',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    emoji: '🌸',
    bg: 'linear-gradient(135deg, #4a0d26 0%, #9d174d 60%, #db2777 100%)',
    titleColor: '#fdf2f8',
    bodyColor: '#fbcfe8',
    accentColor: '#f472b6',
    accentHex: '#f472b6',
    cardBg: 'rgba(255,255,255,0.1)',
    bulletDot: '#f9a8d4',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    bg: 'linear-gradient(135deg, #431407 0%, #9a3412 40%, #ea580c 80%, #f59e0b 100%)',
    titleColor: '#fff7ed',
    bodyColor: '#fed7aa',
    accentColor: '#fb923c',
    accentHex: '#fb923c',
    cardBg: 'rgba(255,255,255,0.08)',
    bulletDot: '#fdba74',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    bg: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e1b4b 100%)',
    titleColor: '#e2e8f0',
    bodyColor: '#94a3b8',
    accentColor: '#818cf8',
    accentHex: '#818cf8',
    cardBg: 'rgba(255,255,255,0.05)',
    bulletDot: '#a5b4fc',
  },
  {
    id: 'minimal',
    name: 'Minimal White',
    emoji: '⬜',
    bg: '#ffffff',
    titleColor: '#0f172a',
    bodyColor: '#475569',
    accentColor: '#6366f1',
    accentHex: '#6366f1',
    cardBg: '#f8fafc',
    bulletDot: '#6366f1',
  },
  {
    id: 'academic',
    name: 'Academic',
    emoji: '🎓',
    bg: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    titleColor: '#fef9c3',
    bodyColor: '#d6d3d1',
    accentColor: '#eab308',
    accentHex: '#eab308',
    cardBg: 'rgba(255,255,255,0.07)',
    bulletDot: '#fde047',
  },
];

export const DEFAULT_THEME_ID = 'professional';

export function getTheme(id: string): SlideTheme {
  return SLIDE_THEMES.find(t => t.id === id) ?? SLIDE_THEMES[0];
}

export function createBlankSlide(themeId = DEFAULT_THEME_ID, layout: SlideLayout = 'content'): Slide {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: 'New Slide',
    bullets: [{ id: 'b1', text: 'Click to edit', level: 0 }],
    notes: '',
    layout,
    themeId,
  };
}

export function createTitleSlide(title = 'Presentation Title', subtitle = 'Subtitle', themeId = DEFAULT_THEME_ID): Slide {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    subtitle,
    bullets: [],
    notes: '',
    layout: 'title',
    themeId,
  };
}
