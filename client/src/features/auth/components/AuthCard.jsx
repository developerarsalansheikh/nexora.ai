import React from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../../providers/UIProvider';

export function AuthCard({ children }) {
  const { theme } = useUI();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="w-full relative"
    >
      <div
        className="w-full rounded-2xl relative overflow-hidden"
        style={{
          /* Responsive padding: tighter on small screens */
          padding: 'clamp(1.25rem, 5vw, 2rem)',
          background: isDark ? 'rgba(15,17,26,0.88)' : 'rgba(255,255,255,0.94)',
          border: isDark
            ? '1px solid rgba(167,139,250,0.18)'
            : '1px solid rgba(99,60,220,0.12)',
          backdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 24px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.06) inset'
            : '0 16px 48px rgba(99,60,220,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(99,60,220,0.3), transparent)',
          }}
        />

        {/* Brand N mark */}
        <div className="flex justify-center mb-5 sm:mb-7">
          <div className="relative">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #6d28d9, #a855f7)',
                boxShadow: '0 8px 24px rgba(109,40,217,0.35)',
              }}
            >
              N
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(139,92,246,0.38)',
                animationDuration: '2.8s',
              }}
            />
          </div>
        </div>

        {children}
      </div>
    </motion.div>
  );
}

export default AuthCard;
