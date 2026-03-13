import React from 'react';
import { Slide, SlideTheme, getTheme } from './slideTypes';

interface SlideCanvasProps {
  slide: Slide;
  scale?: number;
  isThumb?: boolean;
}

export function SlideCanvas({ slide, scale = 1, isThumb = false }: SlideCanvasProps) {
  const theme = getTheme(slide.themeId);
  const fs = isThumb ? { title: 11, body: 7, sub: 6 } : { title: 42, body: 20, sub: 16 };

  return (
    <div
      style={{
        width: 960,
        height: 540,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        background: theme.bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Decorative accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: theme.accentColor, opacity: 0.9,
      }} />

      {/* Decorative circle */}
      {!isThumb && (
        <div style={{
          position: 'absolute', right: -80, bottom: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: theme.accentColor, opacity: 0.05,
        }} />
      )}

      <div style={{ padding: isThumb ? '12px 14px' : '60px 80px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

        {/* TITLE layout */}
        {slide.layout === 'title' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: isThumb ? 4 : 16 }}>
            <div style={{
              color: theme.accentColor,
              fontSize: fs.sub, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8,
            }}>PRESENTATION</div>
            <div style={{ color: theme.titleColor, fontSize: fs.title, fontWeight: 800, lineHeight: 1.15, wordBreak: 'break-word' }}>
              {slide.title}
            </div>
            {slide.subtitle && (
              <div style={{ color: theme.bodyColor, fontSize: isThumb ? 5 : 22, marginTop: isThumb ? 2 : 8, opacity: 0.85 }}>
                {slide.subtitle}
              </div>
            )}
            <div style={{ width: isThumb ? 20 : 60, height: isThumb ? 2 : 4, background: theme.accentColor, borderRadius: 2, marginTop: isThumb ? 4 : 16 }} />
          </div>
        )}

        {/* CONTENT layout */}
        {slide.layout === 'content' && (
          <>
            <div style={{ color: theme.titleColor, fontSize: fs.title, fontWeight: 700, lineHeight: 1.2, marginBottom: isThumb ? 5 : 28, borderBottom: `2px solid ${theme.accentColor}`, paddingBottom: isThumb ? 3 : 12 }}>
              {slide.title}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isThumb ? 2 : 12 }}>
              {slide.bullets.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: isThumb ? 3 : 12, paddingLeft: b.level > 0 ? (isThumb ? 8 : 28) : 0 }}>
                  <div style={{ width: isThumb ? 3 : 8, height: isThumb ? 3 : 8, borderRadius: '50%', background: b.level > 0 ? theme.bodyColor : theme.accentColor, marginTop: isThumb ? 2 : 8, flexShrink: 0, opacity: b.level > 0 ? 0.5 : 1 }} />
                  <div style={{ color: b.level > 0 ? theme.bodyColor : theme.titleColor, fontSize: b.level > 0 ? fs.sub : fs.body, opacity: b.level > 0 ? 0.75 : 1, lineHeight: 1.5 }}>
                    {b.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* QUOTE layout */}
        {slide.layout === 'quote' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: isThumb ? 4 : 20 }}>
            <div style={{ color: theme.accentColor, fontSize: isThumb ? 18 : 72, lineHeight: 1, opacity: 0.4, marginBottom: isThumb ? -4 : -20 }}>"</div>
            <div style={{ color: theme.titleColor, fontSize: isThumb ? 8 : 32, fontWeight: 600, lineHeight: 1.4, fontStyle: 'italic', maxWidth: '80%' }}>
              {slide.quoteText || slide.title}
            </div>
            {slide.quoteAuthor && (
              <div style={{ color: theme.accentColor, fontSize: fs.sub, fontWeight: 600, marginTop: isThumb ? 2 : 12 }}>
                — {slide.quoteAuthor}
              </div>
            )}
          </div>
        )}

        {/* TWO-COL layout */}
        {slide.layout === 'two-col' && (
          <>
            <div style={{ color: theme.titleColor, fontSize: fs.title, fontWeight: 700, marginBottom: isThumb ? 5 : 24, borderBottom: `2px solid ${theme.accentColor}`, paddingBottom: isThumb ? 3 : 10 }}>
              {slide.title}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isThumb ? 6 : 32 }}>
              <div style={{ background: theme.cardBg, borderRadius: isThumb ? 3 : 12, padding: isThumb ? '4px 6px' : '20px 24px', color: theme.bodyColor, fontSize: fs.sub, lineHeight: 1.6 }}>
                {slide.leftContent || 'Left column content'}
              </div>
              <div style={{ background: theme.cardBg, borderRadius: isThumb ? 3 : 12, padding: isThumb ? '4px 6px' : '20px 24px', color: theme.bodyColor, fontSize: fs.sub, lineHeight: 1.6 }}>
                {slide.rightContent || 'Right column content'}
              </div>
            </div>
          </>
        )}

        {/* IMAGE-TEXT layout */}
        {slide.layout === 'image-text' && (
          <>
            <div style={{ color: theme.titleColor, fontSize: fs.title, fontWeight: 700, marginBottom: isThumb ? 5 : 24, borderBottom: `2px solid ${theme.accentColor}`, paddingBottom: isThumb ? 3 : 10 }}>
              {slide.title}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isThumb ? 6 : 32, alignItems: 'center' }}>
              <div style={{ background: theme.cardBg, borderRadius: isThumb ? 3 : 12, overflow: 'hidden', height: '100%', minHeight: isThumb ? 40 : 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {slide.imageUrl
                  ? <img src={slide.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ color: theme.bodyColor, opacity: 0.4, fontSize: fs.sub }}>📷 Image</div>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isThumb ? 2 : 12 }}>
                {slide.bullets.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: isThumb ? 3 : 10 }}>
                    <div style={{ width: isThumb ? 3 : 6, height: isThumb ? 3 : 6, borderRadius: '50%', background: theme.accentColor, marginTop: isThumb ? 2 : 8, flexShrink: 0 }} />
                    <div style={{ color: theme.titleColor, fontSize: fs.sub, lineHeight: 1.5 }}>{b.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BLANK layout */}
        {slide.layout === 'blank' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.bodyColor, opacity: 0.2, fontSize: fs.body }}>
            Blank Slide
          </div>
        )}
      </div>

      {/* Slide number indicator (not in thumbnails) */}
      {!isThumb && (
        <div style={{ position: 'absolute', bottom: 16, right: 24, color: theme.bodyColor, opacity: 0.3, fontSize: 10, fontWeight: 600 }}>
          KOLAGE
        </div>
      )}
    </div>
  );
}
