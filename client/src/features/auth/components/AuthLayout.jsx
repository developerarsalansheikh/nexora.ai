import React, { useEffect, useRef } from 'react';
import { useUI } from '../../../providers/UIProvider';

export function AuthLayout({ children }) {
  const { theme, toggleTheme } = useUI();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const dots = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.5,
      dx: (Math.random() - 0.5) * 0.32,
      dy: (Math.random() - 0.5) * 0.32,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const dotColor = '192,132,252';
      const lineColor = '167,139,250';

      dots.forEach((a, i) => {
        dots.forEach((b, j) => {
          if (j <= i) return;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor},${0.13 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor},${a.opacity})`;
        ctx.fill();
        a.x += a.dx;
        a.y += a.dy;
        if (a.x < 0 || a.x > w) a.dx *= -1;
        if (a.y < 0 || a.y > h) a.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row bg-bg-primary text-text-primary font-sans"
      style={{ overflowX: 'hidden' }}
    >
      {/* ══════════ LEFT PANEL (hidden on mobile/tablet) ══════════ */}
      <div
        className="hidden lg:flex lg:w-[50%] xl:w-[52%] relative overflow-hidden flex-col shrink-0"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a0b14 0%, #0e0f1e 50%, #12102b 100%)'
            : 'linear-gradient(135deg, #4338ca 0%, #5b21b6 50%, #6d28d9 100%)',
          minHeight: '100vh',
        }}
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Glow blobs */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(192,132,252,0.18) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12 justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 select-none">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-2xl font-black text-lg text-white shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              N
            </div>
            <span className="font-bold text-xl tracking-wide text-white">
              Nexora<span style={{ color: 'rgba(255,255,255,0.6)' }}>.ai</span>
            </span>
          </div>

          {/* Hero */}
          <div className="space-y-7 max-w-md">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#c4b5fd' }}
              />
              Enterprise AI Platform
            </div>

            <h2
              className="text-4xl xl:text-[2.75rem] font-extrabold tracking-tight leading-[1.1] text-white"
            >
              Intelligent project
              <span
                className="block mt-1.5"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(216,180,254,0.85))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                management.
              </span>
            </h2>

            <p
              className="text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              Plan sprints, track velocity, and collaborate with AI-assisted
              workflows inside one adaptive workspace.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['AI Sprint Planning', 'Real-time Boards', 'Team Analytics', 'Auto Reports'].map(
                (f) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: 'rgba(255,255,255,0.78)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    ✦ {f}
                  </span>
                )
              )}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#7c3aed', '#a855f7', '#6366f1', '#8b5cf6'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: c, borderColor: '#5b21b6' }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.58)' }}>
                Trusted by <strong className="text-white">2,400+</strong> teams worldwide
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Nexora.ai Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Radial bg */}
        <div
          className="absolute top-0 right-0 w-[70%] h-[50%] pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 80% 10%, rgba(139,92,246,0.07) 0%, transparent 70%)'
              : 'radial-gradient(circle at 80% 10%, rgba(99,60,220,0.05) 0%, transparent 70%)',
          }}
        />

        {/* Mobile top bar — visible only < lg */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(99,60,220,0.08)' }}>
          <div className="flex items-center gap-2.5 select-none">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-base text-white"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)' }}
            >
              N
            </div>
            <span className="font-bold text-base text-text-primary">
              Nexora<span className="text-brand-500">.ai</span>
            </span>
          </div>
          {/* Theme toggle mobile */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn-mobile"
            className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer text-sm outline-none select-none"
            style={{
              borderColor: isDark ? 'rgba(167,139,250,0.2)' : 'rgba(99,60,220,0.15)',
              background: isDark ? 'rgba(22,25,38,0.8)' : 'rgba(255,255,255,0.9)',
              color: isDark ? '#a78bfa' : '#6d28d9',
            }}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Desktop theme toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="hidden lg:flex absolute top-6 right-6 w-9 h-9 rounded-xl border items-center justify-center transition-all duration-200 cursor-pointer z-50 text-sm outline-none select-none hover:scale-105"
          style={{
            borderColor: isDark ? 'rgba(167,139,250,0.2)' : 'rgba(99,60,220,0.15)',
            background: isDark ? 'rgba(22,25,38,0.8)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            color: isDark ? '#a78bfa' : '#6d28d9',
          }}
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Centered form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
          <p className="mt-6 text-xs text-text-tertiary text-center">
            Secured with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
