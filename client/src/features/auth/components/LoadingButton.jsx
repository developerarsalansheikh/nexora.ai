import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useUI } from '../../../providers/UIProvider';

export function LoadingButton({
  children,
  isLoading,
  type = 'submit',
  className,
  disabled,
  id,
  ...props
}) {
  const { theme } = useUI();
  const isDark = theme === 'dark';

  return (
    <button
      type={type}
      id={id}
      disabled={disabled || isLoading}
      className={clsx(
        'w-full relative flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden group transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none select-none',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)',
        boxShadow: isDark
          ? '0 8px 24px rgba(109,40,217,0.3), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 8px 20px rgba(109,40,217,0.25)',
      }}
      {...props}
    >
      {/* Hover glow overlay */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
        }}
      />
      {/* Shine sweep */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        }}
      />

      <span className="relative z-10 flex items-center gap-2.5">
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wide">Signing in...</span>
          </>
        ) : (
          <span className="tracking-wide">{children}</span>
        )}
      </span>
    </button>
  );
}

export default LoadingButton;
