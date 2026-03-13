import React, { useState, useCallback, useRef } from 'react';
import {
  Plus, Trash2, Download, Sparkles, Loader2, ChevronDown,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Type, Copy, FileText, Columns, Quote, Image, Layout,
  Play, SkipForward, SkipBack, StickyNote, Palette,
  GripVertical, X, Check, Wand2,
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/lib/utils';
import {
  Slide, SlideLayout, SlideStyle, SlideBullet,
  SLIDE_THEMES, getTheme, createBlankSlide, createTitleSlide,
} from './slideTypes';
import { SlideCanvas } from './SlideCanvas';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
interface SlideTabProps {
  tabId: string;
}

// ──────────────────────────────────────────────
// AI Generation Wizard steps
// ──────────────────────────────────────────────
type WizardStep = 'topic' | 'options' | 'theme' | 'generating';

const LAYOUTS: { id: SlideLayout; label: string; icon: React.ReactNode }[] = [
  { id: 'title', label: 'Title', icon: <Type className="h-4 w-4" /> },
  { id: 'content', label: 'Content', icon: <AlignLeft className="h-4 w-4" /> },
  { id: 'two-col', label: '2 Column', icon: <Columns className="h-4 w-4" /> },
  { id: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" /> },
  { id: 'image-text', label: 'Image+Text', icon: <Image className="h-4 w-4" /> },
  { id: 'blank', label: 'Blank', icon: <Layout className="h-4 w-4" /> },
];

const NEU_BG = "hsl(var(--neu-bg))";
const NEU_RAISED = "5px 5px 10px hsl(var(--neu-shadow-dark)), -5px -5px 10px hsl(var(--neu-shadow-light))";
const NEU_INSET = "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))";
const NEU_RAISED_SM = "3px 3px 6px hsl(var(--neu-shadow-dark)), -3px -3px 6px hsl(var(--neu-shadow-light))";

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

const STYLES = {
  style1: {  position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'  } as React.CSSProperties,
  style2: {  position: 'relative', width: '90vw', maxWidth: 1200, aspectRatio: '16/9'  } as React.CSSProperties,
  style3: {  width: '100%', paddingBottom: '56.25%', position: 'relative', overflow: 'hidden', borderRadius: 12  } as React.CSSProperties,
  style4: {  display: 'flex', gap: 12, marginTop: 24, alignItems: 'center'  } as React.CSSProperties,
  style5: {  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer'  } as React.CSSProperties,
  style6: {  color: '#fff', opacity: 0.7, fontSize: 14  } as React.CSSProperties,
  style7: {  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer'  } as React.CSSProperties,
  style8: {  background: 'rgba(220,38,38,0.7)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', marginLeft: 8  } as React.CSSProperties,
  style9: {  background: NEU_BG  } as React.CSSProperties,
  style10: {  background: NEU_BG, boxShadow: '0 3px 8px hsl(var(--neu-shadow-dark)/0.3)'  } as React.CSSProperties,
  style11: {  background: 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))', boxShadow: '3px 3px 8px hsl(var(--neu-shadow-dark)), -1px -1px 4px hsl(var(--neu-shadow-light)), 0 0 14px hsl(var(--spark)/0.3)'  } as React.CSSProperties,
  style12: {  width: 1, height: 28, background: 'hsl(var(--neu-shadow-dark))', opacity: 0.3  } as React.CSSProperties,
  style13: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style14: {  width: 1, height: 28, background: 'hsl(var(--neu-shadow-dark))', opacity: 0.3  } as React.CSSProperties,
  style15: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style16: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style17: {  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '3px 3px 8px hsl(var(--neu-shadow-dark)), -1px -1px 4px hsl(var(--neu-shadow-light))'  } as React.CSSProperties,
  style18: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style19: {  background: NEU_BG, boxShadow: '4px 0 10px hsl(var(--neu-shadow-dark)/0.2)'  } as React.CSSProperties,
  style20: {  padding: '3px 4px 4px', background: NEU_BG  } as React.CSSProperties,
  style21: {  fontSize: 9, color: 'hsl(var(--ink-faint))'  } as React.CSSProperties,
  style22: {  fontSize: 8  } as React.CSSProperties,
  style23: {  borderColor: 'hsl(var(--neu-shadow-dark)/0.3)'  } as React.CSSProperties,
  style24: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style25: {  background: 'hsl(var(--neu-bg))'  } as React.CSSProperties,
  style26: { 
              width: 'min(90%, 960px)',
              aspectRatio: '16/9',
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '20px 20px 40px hsl(var(--neu-shadow-dark)), -10px -10px 30px hsl(var(--neu-shadow-light))',
             } as React.CSSProperties,
  style27: {  position: 'absolute', inset: 0  } as React.CSSProperties,
  style28: {  height: 120, borderTop: '1px solid hsl(var(--neu-shadow-dark)/0.3)', background: NEU_BG, padding: '10px 16px'  } as React.CSSProperties,
  style29: {  background: NEU_BG, boxShadow: '-4px 0 10px hsl(var(--neu-shadow-dark)/0.2)'  } as React.CSSProperties,
  style30: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style31: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style32: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style33: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style34: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style35: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style36: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style37: {  fontSize: 8  } as React.CSSProperties,
  style38: {  fontSize: 8  } as React.CSSProperties,
  style39: {  background: NEU_BG, boxShadow: NEU_INSET, paddingLeft: 8 + b.level * 12  } as React.CSSProperties,
  style40: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style41: {  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center'  } as React.CSSProperties,
  style42: {  background: NEU_BG, boxShadow: '20px 20px 40px hsl(var(--neu-shadow-dark)), -10px -10px 30px hsl(var(--neu-shadow-light))', width: 540, maxWidth: '95vw'  } as React.CSSProperties,
  style43: {  borderBottom: '1px solid hsl(var(--neu-shadow-dark)/0.3)'  } as React.CSSProperties,
  style44: {  background: 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))', borderRadius: 12, padding: 8, boxShadow: '0 0 14px hsl(var(--spark)/0.4)'  } as React.CSSProperties,
  style45: {  background: NEU_BG, boxShadow: NEU_RAISED_SM, borderRadius: 10, padding: 6  } as React.CSSProperties,
  style46: {  flex: 1, height: 2, background: 'hsl(var(--neu-shadow-dark)/0.3)', borderRadius: 1  } as React.CSSProperties,
  style47: {  background: NEU_BG, boxShadow: NEU_INSET  } as React.CSSProperties,
  style48: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style49: {  background: 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))', boxShadow: '3px 3px 8px hsl(var(--neu-shadow-dark)), 0 0 14px hsl(var(--spark)/0.3)'  } as React.CSSProperties,
  style50: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style51: {  background: 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))', boxShadow: '3px 3px 8px hsl(var(--neu-shadow-dark)), 0 0 14px hsl(var(--spark)/0.3)'  } as React.CSSProperties,
  style52: {  background: NEU_BG, boxShadow: NEU_RAISED_SM  } as React.CSSProperties,
  style53: {  background: 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))', boxShadow: '3px 3px 8px hsl(var(--neu-shadow-dark)), 0 0 18px hsl(var(--spark)/0.4)'  } as React.CSSProperties,
  style54: {  background: 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))', borderRadius: '50%', padding: 16, boxShadow: '0 0 30px hsl(var(--spark)/0.5)'  } as React.CSSProperties,
};

export function SlideTab({ tabId }: SlideTabProps) {
  const [slides, setSlides] = useState<Slide[]>([
    createTitleSlide('Click to Edit Title', 'Your subtitle here', 'professional'),
  ]);
  const [activeId, setActiveId] = useState(slides[0].id);
  const [deckThemeId, setDeckThemeId] = useState('professional');
  const [showNotes, setShowNotes] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('topic');
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [style, setStyle] = useState<SlideStyle>('professional');
  const [wizardTheme, setWizardTheme] = useState('professional');
  const [showPresent, setShowPresent] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const { generateSlides, isLoading } = useAI();
  const canvasRef = useRef<HTMLDivElement>(null);

  const active = slides.find(s => s.id === activeId) ?? slides[0];
  const activeIdx = slides.findIndex(s => s.id === activeId);

  // ── Slide mutations ──
  const updateActive = useCallback((patch: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === activeId ? { ...s, ...patch } : s));
  }, [activeId]);

  const addSlide = (layout: SlideLayout = 'content') => {
    const s = createBlankSlide(deckThemeId, layout);
    if (layout === 'title') s.subtitle = 'Subtitle';
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === activeId);
      const next = [...prev];
      next.splice(idx + 1, 0, s);
      return next;
    });
    setActiveId(s.id);
  };

  const duplicateSlide = () => {
    const copy: Slide = { ...active, id: `slide-${Date.now()}` };
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === activeId);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setActiveId(copy.id);
  };

  const deleteSlide = (id: string) => {
    if (slides.length === 1) return;
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const next = prev.filter(s => s.id !== id);
      setActiveId(next[Math.max(0, idx - 1)].id);
      return next;
    });
  };

  // ── Bullet mutations ──
  const addBullet = () => {
    const b: SlideBullet = { id: `b-${Date.now()}`, text: '', level: 0 };
    updateActive({ bullets: [...active.bullets, b] });
    setTimeout(() => setEditingBulletId(b.id), 50);
  };

  const updateBullet = (id: string, text: string) => {
    updateActive({ bullets: active.bullets.map(b => b.id === id ? { ...b, text } : b) });
  };

  const deleteBullet = (id: string) => {
    updateActive({ bullets: active.bullets.filter(b => b.id !== id) });
  };

  const indentBullet = (id: string, dir: 1 | -1) => {
    updateActive({
      bullets: active.bullets.map(b =>
        b.id === id ? { ...b, level: Math.max(0, Math.min(2, b.level + dir)) } : b
      )
    });
  };

  // ── Apply deck theme ──
  const applyDeckTheme = (id: string) => {
    setDeckThemeId(id);
    setSlides(prev => prev.map(s => ({ ...s, themeId: id })));
  };

  // ── AI Generation ──
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setWizardStep('generating');
    try {
      const result = await generateSlides(topic, style);
      if (result?.slides?.length) {
        const themed = result.slides.map((s: any) => ({
          id: `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: s.title ?? 'Slide',
          subtitle: s.subtitle,
          bullets: (s.bullets ?? (s.content ? [{ id: 'b1', text: s.content, level: 0 }] : [])).map((bt: any, i: number) =>
            typeof bt === 'string'
              ? { id: `b${i}`, text: bt, level: 0 }
              : { id: bt.id ?? `b${i}`, text: bt.text ?? bt, level: bt.level ?? 0 }
          ),
          notes: s.notes ?? '',
          layout: (s.layout as SlideLayout) ?? 'content',
          themeId: wizardTheme,
          quoteText: s.quoteText,
          quoteAuthor: s.quoteAuthor,
        }));
        setSlides(themed);
        setDeckThemeId(wizardTheme);
        setActiveId(themed[0].id);
      }
    } finally {
      setShowWizard(false);
      setWizardStep('topic');
      setTopic('');
    }
  };

  // ── Export ──
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(slides, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${topic || 'presentation'}.json`;
    a.click();
  };

  // ── Canvas scale ──
  const CANVAS_W = 960;
  const CANVAS_H = 540;
  const THUMB_SCALE = 136 / CANVAS_W;

  // ══════════════════════════════════════════════
  // PRESENTATION MODE
  // ══════════════════════════════════════════════
  if (showPresent) {
    const pSlide = slides[presentIdx];
    const pTheme = getTheme(pSlide.themeId);
    return (
      <div style={STYLES.style1}>
        <div style={STYLES.style2}>
          <div style={STYLES.style3}>
            <div style={{ position: 'absolute', inset: 0, transform: `scale(${(window.innerWidth * 0.9) / CANVAS_W})`, transformOrigin: 'top left' }}>
              <SlideCanvas slide={pSlide} scale={1} />
            </div>
          </div>
        </div>
        {/* Controls */}
        <div style={STYLES.style4}>
          <button onClick={() => setPresentIdx(i => Math.max(0, i - 1))} style={STYLES.style5}>
            <SkipBack className="h-5 w-5" />
          </button>
          <span style={STYLES.style6}>{presentIdx + 1} / {slides.length}</span>
          <button onClick={() => setPresentIdx(i => Math.min(slides.length - 1, i + 1))} style={STYLES.style7}>
            <SkipForward className="h-5 w-5" />
          </button>
          <button onClick={() => setShowPresent(false)} style={STYLES.style8}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // MAIN EDITOR
  // ══════════════════════════════════════════════
  return (
    <div className="h-full flex flex-col" style={STYLES.style9}>

      {/* ── TOP TOOLBAR ── */}
      <div className="flex items-center gap-2 px-4 py-2 flex-wrap" style={STYLES.style10}>
        {/* AI Generate */}
        <button
          onClick={() => { setShowWizard(true); setWizardStep('topic'); }}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all"
          style={STYLES.style11}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? 'Generating...' : 'AI Generate'}
        </button>

        <div style={STYLES.style12} />

        {/* Add slide dropdown (quick) */}
        {LAYOUTS.map(l => (
          <button key={l.id} title={`Add ${l.label}`} onClick={() => addSlide(l.id)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-light hover:text-ink transition-all"
            style={STYLES.style13}>
            {l.icon}<span className="hidden lg:inline">{l.label}</span>
          </button>
        ))}

        <div style={STYLES.style14} />

        {/* Duplicate */}
        <button title="Duplicate slide" onClick={duplicateSlide}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-light hover:text-ink transition-all"
          style={STYLES.style15}>
          <Copy className="h-4 w-4" />
        </button>

        {/* Delete */}
        {slides.length > 1 && (
          <button title="Delete slide" onClick={() => deleteSlide(activeId)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:text-red-500 transition-all"
            style={STYLES.style16}>
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <div className="flex-1" />

        {/* Notes toggle */}
        <button onClick={() => setShowNotes(v => !v)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all"
          style={{ background: NEU_BG, boxShadow: showNotes ? NEU_INSET : NEU_RAISED_SM, color: showNotes ? 'hsl(var(--spark))' : 'hsl(var(--ink-light))' }}>
          <StickyNote className="h-4 w-4" /><span className="hidden sm:inline">Notes</span>
        </button>

        {/* Present */}
        <button onClick={() => { setShowPresent(true); setPresentIdx(activeIdx); }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all"
          style={STYLES.style17}>
          <Play className="h-4 w-4" /> Present
        </button>

        {/* Export */}
        <button onClick={exportJSON}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-light hover:text-ink transition-all"
          style={STYLES.style18}>
          <Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* ── MAIN 3-PANEL AREA ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Slide Panel ── */}
        <div className="flex flex-col w-40 shrink-0 overflow-y-auto" style={STYLES.style19}>
          <div className="flex-1 p-2 space-y-2">
            {slides.map((s, i) => {
              const isAct = s.id === activeId;
              return (
                <div key={s.id} onClick={() => setActiveId(s.id)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden transition-all"
                  style={{ boxShadow: isAct ? NEU_INSET + ', 0 0 0 2px hsl(var(--spark)/0.5)' : NEU_RAISED_SM }}>
                  {/* Thumbnail */}
                  <div style={{ width: 136, height: 77, overflow: 'hidden', position: 'relative', background: getTheme(s.themeId).bg || '#1e293b' }}>
                    <div style={{ transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                      <SlideCanvas slide={s} scale={1} isThumb />
                    </div>
                  </div>
                  <div style={STYLES.style20}>
                    <span style={STYLES.style21}>#{i + 1} {s.title.slice(0, 18)}</span>
                  </div>
                  {/* Delete on hover */}
                  {slides.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); deleteSlide(s.id); }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-4 w-4 flex items-center justify-center bg-red-500 text-white"
                      style={STYLES.style22}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t" style={STYLES.style23}>
            <button onClick={() => addSlide('content')}
              className="flex items-center justify-center gap-1 w-full rounded-xl py-2 text-xs font-medium text-ink-light hover:text-spark transition-all"
              style={STYLES.style24}>
              <Plus className="h-3.5 w-3.5" /> Add Slide
            </button>
          </div>
        </div>

        {/* ── CENTER: Canvas ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-start justify-center overflow-auto p-8" style={STYLES.style25}
            ref={canvasRef}>
            {/* Aspect-ratio wrapper */}
            <div style={STYLES.style26}>
              <div style={STYLES.style27}>
                {/* Render canvas scaled */}
                <div style={{
                  width: CANVAS_W,
                  height: CANVAS_H,
                  transform: `scale(calc((min(90vw - 200px, 960px)) / 960))`,
                  transformOrigin: 'top left',
                }}>
                  <SlideCanvas slide={active} scale={1} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Notes area ── */}
          {showNotes && (
            <div style={STYLES.style28}>
              <div className="text-xs font-semibold text-ink-faint mb-1">Speaker Notes</div>
              <textarea
                value={active.notes}
                onChange={e => updateActive({ notes: e.target.value })}
                placeholder="Add speaker notes for this slide..."
                className="w-full h-16 resize-none bg-transparent text-sm text-ink-light focus:outline-none placeholder:text-ink-faint"
              />
            </div>
          )}
        </div>

        {/* ── RIGHT: Properties Panel ── */}
        <div className="w-64 shrink-0 overflow-y-auto flex flex-col gap-4 p-4" style={STYLES.style29}>

          {/* Layout picker */}
          <div>
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-2">Layout</div>
            <div className="grid grid-cols-3 gap-1.5">
              {LAYOUTS.map(l => (
                <button key={l.id} title={l.label} onClick={() => updateActive({ layout: l.id })}
                  className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-all"
                  style={{ background: NEU_BG, boxShadow: active.layout === l.id ? NEU_INSET + ', 0 0 0 1.5px hsl(var(--spark)/0.5)' : NEU_RAISED_SM, color: active.layout === l.id ? 'hsl(var(--spark))' : 'hsl(var(--ink-light))' }}>
                  {l.icon}{l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme picker */}
          <div>
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-2">Theme</div>
            <div className="grid grid-cols-2 gap-2">
              {SLIDE_THEMES.map(t => (
                <button key={t.id} onClick={() => applyDeckTheme(t.id)}
                  className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium transition-all"
                  style={{ background: t.bg, boxShadow: deckThemeId === t.id ? '0 0 0 2px hsl(var(--spark)), 3px 3px 7px hsl(var(--neu-shadow-dark))' : NEU_RAISED_SM, color: t.titleColor }}>
                  <span>{t.emoji}</span>
                  <span className="truncate text-[11px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slide content editor */}
          <div>
            <div className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-2">Content</div>
            <div className="space-y-2">
              {/* Title */}
              <input
                value={active.title}
                onChange={e => updateActive({ title: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-ink focus:outline-none"
                style={STYLES.style30}
                placeholder="Slide title"
              />
              {/* Subtitle (title layout) */}
              {active.layout === 'title' && (
                <input
                  value={active.subtitle ?? ''}
                  onChange={e => updateActive({ subtitle: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-sm text-ink-light focus:outline-none"
                  style={STYLES.style31}
                  placeholder="Subtitle"
                />
              )}
              {/* Quote fields */}
              {active.layout === 'quote' && (
                <>
                  <textarea
                    value={active.quoteText ?? ''}
                    onChange={e => updateActive({ quoteText: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm text-ink resize-none focus:outline-none"
                    style={STYLES.style32}
                    placeholder="Quote text..." rows={3}
                  />
                  <input
                    value={active.quoteAuthor ?? ''}
                    onChange={e => updateActive({ quoteAuthor: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm text-ink-light focus:outline-none"
                    style={STYLES.style33}
                    placeholder="— Author name"
                  />
                </>
              )}
              {/* Two-col fields */}
              {active.layout === 'two-col' && (
                <>
                  <textarea value={active.leftContent ?? ''} onChange={e => updateActive({ leftContent: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm text-ink resize-none focus:outline-none"
                    style={STYLES.style34} placeholder="Left column..." rows={3} />
                  <textarea value={active.rightContent ?? ''} onChange={e => updateActive({ rightContent: e.target.value })}
                    className="w-full rounded-xl px-3 py-2 text-sm text-ink resize-none focus:outline-none"
                    style={STYLES.style35} placeholder="Right column..." rows={3} />
                </>
              )}
            </div>
          </div>

          {/* Bullets editor */}
          {(active.layout === 'content' || active.layout === 'image-text') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-ink-faint uppercase tracking-wider">Bullets</div>
                <button onClick={addBullet}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-light hover:text-spark transition-all"
                  style={STYLES.style36}>
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-1.5">
                {active.bullets.map(b => (
                  <div key={b.id} className="flex items-center gap-1">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => indentBullet(b.id, -1)} className="text-ink-faint hover:text-ink" style={STYLES.style37}>◀</button>
                      <button onClick={() => indentBullet(b.id, 1)} className="text-ink-faint hover:text-ink" style={STYLES.style38}>▶</button>
                    </div>
                    <input
                      value={b.text}
                      onChange={e => updateBullet(b.id, e.target.value)}
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs text-ink focus:outline-none"
                      style={{ background: NEU_BG, boxShadow: NEU_INSET, paddingLeft: 8 + b.level * 12 }}
                      placeholder="Bullet point..."
                      autoFocus={editingBulletId === b.id}
                    />
                    <button onClick={() => deleteBullet(b.id)} className="text-ink-faint hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image URL */}
          {active.layout === 'image-text' && (
            <div>
              <div className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-2">Image URL</div>
              <input
                value={active.imageUrl ?? ''}
                onChange={e => updateActive({ imageUrl: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-xs text-ink focus:outline-none"
                style={STYLES.style40}
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          AI GENERATION WIZARD MODAL
      ══════════════════════════════════════════ */}
      {showWizard && (
        <div style={STYLES.style41}>
          <div className="rounded-3xl p-0 overflow-hidden" style={STYLES.style42}>
            {/* Wizard Header */}
            <div className="flex items-center justify-between px-6 py-5" style={STYLES.style43}>
              <div className="flex items-center gap-3">
                <div style={STYLES.style44}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-ink">AI Deck Generator</div>
                  <div className="text-xs text-ink-faint">Powered by Gamma-style AI</div>
                </div>
              </div>
              <button onClick={() => setShowWizard(false)} style={STYLES.style45}>
                <X className="h-4 w-4 text-ink-light" />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex px-6 pt-4 gap-2">
              {(['topic', 'options', 'theme'] as WizardStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: wizardStep === s || (wizardStep === 'generating') ? 'linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))' : NEU_BG, color: wizardStep === s ? 'white' : 'hsl(var(--ink-faint))', boxShadow: NEU_RAISED_SM }}>
                    {i + 1}
                  </div>
                  {i < 2 && <div style={STYLES.style46} />}
                </div>
              ))}
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* STEP 1: Topic */}
              {wizardStep === 'topic' && (
                <>
                  <div className="font-semibold text-ink">What's your presentation about?</div>
                  <textarea
                    autoFocus
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. 'The Future of Renewable Energy' or 'Q3 Sales Strategy'"
                    rows={3}
                    className="w-full rounded-2xl px-4 py-3 text-sm text-ink resize-none focus:outline-none"
                    style={STYLES.style47}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {['Climate Change', 'Machine Learning', 'Marketing Strategy', 'Health & Wellness', 'Financial Report'].map(s => (
                      <button key={s} onClick={() => setTopic(s)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-light hover:text-ink transition-all"
                        style={STYLES.style48}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => setWizardStep('options')} disabled={!topic.trim()}
                      className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-40"
                      style={STYLES.style49}>
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: Options */}
              {wizardStep === 'options' && (
                <>
                  <div className="font-semibold text-ink">Presentation options</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-ink-faint mb-1.5">Number of slides: <strong className="text-ink">{slideCount}</strong></div>
                      <input type="range" min={4} max={20} value={slideCount} onChange={e => setSlideCount(+e.target.value)}
                        className="w-full accent-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs text-ink-faint mb-1.5">Tone</div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['professional', 'creative', 'academic', 'minimal', 'bold'] as SlideStyle[]).map(s => (
                          <button key={s} onClick={() => setStyle(s)}
                            className="capitalize rounded-xl py-2 text-xs font-medium transition-all"
                            style={{ background: NEU_BG, boxShadow: style === s ? NEU_INSET + ',0 0 0 1.5px hsl(var(--spark)/0.5)' : NEU_RAISED_SM, color: style === s ? 'hsl(var(--spark))' : 'hsl(var(--ink-light))' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setWizardStep('topic')} className="rounded-xl px-4 py-2 text-sm text-ink-light" style={STYLES.style50}>← Back</button>
                    <button onClick={() => setWizardStep('theme')} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={STYLES.style51}>Next →</button>
                  </div>
                </>
              )}

              {/* STEP 3: Theme */}
              {wizardStep === 'theme' && (
                <>
                  <div className="font-semibold text-ink">Pick a visual theme</div>
                  <div className="grid grid-cols-2 gap-3">
                    {SLIDE_THEMES.map(t => (
                      <button key={t.id} onClick={() => setWizardTheme(t.id)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all"
                        style={{ background: t.bg, color: t.titleColor, boxShadow: wizardTheme === t.id ? `0 0 0 2.5px hsl(var(--spark)), 5px 5px 12px hsl(var(--neu-shadow-dark))` : NEU_RAISED_SM }}>
                        <span className="text-xl">{t.emoji}</span>
                        <span>{t.name}</span>
                        {wizardTheme === t.id && <Check className="h-4 w-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setWizardStep('options')} className="rounded-xl px-4 py-2 text-sm text-ink-light" style={STYLES.style52}>← Back</button>
                    <button onClick={handleGenerate}
                      className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
                      style={STYLES.style53}>
                      <Sparkles className="h-4 w-4" /> Generate Deck
                    </button>
                  </div>
                </>
              )}

              {/* Generating state */}
              {wizardStep === 'generating' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div style={STYLES.style54}>
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <div className="font-bold text-ink">Generating your deck...</div>
                  <div className="text-sm text-ink-faint text-center">AI is crafting {slideCount} slides about<br /><strong className="text-ink">{topic}</strong></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
