import { useEffect, useRef, useState } from 'react';
import { X, Download, Copy, Check, Palette } from 'lucide-react';

interface VerseCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseRef: string;
  verseText: string;
}

type CardTheme = 'noite_escura' | 'ouro_celestial' | 'azul_sereno' | 'sol_nascente';

export function VerseCardModal({ isOpen, onClose, verseRef, verseText }: VerseCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('ouro_celestial');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const themes = {
    noite_escura: {
      name: 'Noite Escura',
      background: '#090d16',
      textColor: '#f1f5f9',
      refColor: '#38bdf8',
      glowColor1: '#581c87', // deep purple
      glowColor2: '#1e3a8a', // deep blue
    },
    ouro_celestial: {
      name: 'Ouro Celestial',
      background: '#0a0a0c',
      textColor: '#f8fafc',
      refColor: '#d4a359', // warm gold
      glowColor1: '#3f2b11', // amber/gold glow
      glowColor2: '#1c1917', // dark stone
    },
    azul_sereno: {
      name: 'Azul Sereno',
      background: '#060f14',
      textColor: '#f1f5f9',
      refColor: '#2dd4bf', // teal
      glowColor1: '#115e59', // teal glow
      glowColor2: '#0f172a', // slate
    },
    sol_nascente: {
      name: 'Sol Nascente',
      background: '#150909',
      textColor: '#fffbeb',
      refColor: '#f43f5e', // rose
      glowColor1: '#701a28', // red/rose glow
      glowColor2: '#180828', // deep magenta/indigo glow
    }
  };

  // Re-draw canvas whenever theme, verse text, or openness changes
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    drawCard();
  }, [isOpen, selectedTheme, verseText, verseRef]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = themes[selectedTheme];

    // 1. High Definition Scaling (Double resolution for crisp text)
    const cardWidth = 800;
    const cardHeight = 1000;
    canvas.width = cardWidth;
    canvas.height = cardHeight;

    // 2. Draw Solid Background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // 3. Draw Background Glowing Radial Gradients (Premium Light Effect)
    // Glow 1: Top Right
    let gradient1 = ctx.createRadialGradient(cardWidth * 0.8, cardHeight * 0.2, 50, cardWidth * 0.8, cardHeight * 0.2, 450);
    gradient1.addColorStop(0, theme.glowColor1);
    gradient1.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Glow 2: Bottom Left
    let gradient2 = ctx.createRadialGradient(cardWidth * 0.2, cardHeight * 0.8, 50, cardWidth * 0.2, cardHeight * 0.8, 450);
    gradient2.addColorStop(0, theme.glowColor2);
    gradient2.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // 4. Draw Inner Glassmorphic Border Accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, cardWidth - 80, cardHeight - 80);

    // 5. Draw Decorative Quote Mark "“"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = '350px Georgia, serif';
    ctx.fillText('“', 80, 320);

    // 6. Draw Scripture Text wrapping
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Select best responsive font size depending on text length
    let fontSize = 38;
    if (verseText.length > 250) fontSize = 28;
    else if (verseText.length > 150) fontSize = 32;
    
    ctx.font = `italic ${fontSize}px Lora, Georgia, serif`;

    const marginX = 120;
    const maxWidth = cardWidth - (marginX * 2);
    const lineHeight = fontSize * 1.5;

    // Split text into lines
    const words = verseText.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Calculate vertical starting position (center-aligned)
    const totalTextHeight = lines.length * lineHeight;
    let startY = (cardHeight - totalTextHeight) / 2 - 30; // slightly offset upwards for balance

    // Render lines of text
    lines.forEach((l, index) => {
      ctx.fillText(l, cardWidth / 2, startY + (index * lineHeight));
    });

    // 7. Draw Divider Line
    const dividerY = startY + totalTextHeight + 40;
    ctx.beginPath();
    ctx.moveTo(cardWidth / 2 - 40, dividerY);
    ctx.lineTo(cardWidth / 2 + 40, dividerY);
    ctx.strokeStyle = theme.refColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 8. Draw Reference / Book Chapter
    ctx.fillStyle = theme.refColor;
    ctx.font = 'bold 30px Inter, system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(verseRef.toUpperCase(), cardWidth / 2, dividerY + 60);

    // 9. Draw App Subtitle watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('DEVOCIONAL APP', cardWidth / 2, cardHeight - 80);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `card-${verseRef.toLowerCase().replace(/[\s:]/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar imagem. Por favor, tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    const formattedText = `📖 *${verseRef}*\n"${verseText}"\n\nCompartilhado do Devocional App`;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      
      {/* Modal Container */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <X size={22} />
        </button>

        {/* Column 1: Canvas Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PREVIZUALIZAÇÃO EM HD</span>
          <div style={{
            width: '100%',
            maxWidth: '300px',
            aspectRatio: '8/10',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid var(--glass-border)'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Column 2: Controls & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-gold)' }}>🎨 Card de Versículo</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
              Crie uma imagem de altíssima qualidade pronta para compartilhar no WhatsApp, Instagram ou Telegram.
            </p>
          </div>

          {/* Theme Presets */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
              <Palette size={14} /> SELECIONE UM ESTILO
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.keys(themes).map((key) => {
                const active = selectedTheme === key;
                const th = themes[key as CardTheme];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTheme(key as CardTheme)}
                    style={{
                      background: active ? 'var(--accent-gold-muted)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                      color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: th.refColor,
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: `0 0 5px ${th.refColor}`
                    }} />
                    {th.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--glass-border)' }} />

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 'bold'
              }}
            >
              <Download size={18} />
              {downloading ? 'Gerando Imagem...' : 'Baixar Card de Imagem'}
            </button>

            <button
              onClick={handleCopyText}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                borderColor: 'var(--glass-border)'
              }}
            >
              {copied ? (
                <>
                  <Check size={18} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ color: 'var(--accent-green)' }}>Texto Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copiar Versículo Formatado</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Embedded Google Font import to make Lora available for canvas rendering */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,500&display=swap');
        @media (max-width: 768px) {
          .glass-panel {
            grid-template-columns: 1fr !important;
            padding: 1.5rem !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
