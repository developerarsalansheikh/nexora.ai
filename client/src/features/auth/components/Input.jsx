import React from 'react';
import clsx from 'clsx';
import { useUI } from '../../../providers/UIProvider';

export const Input = React.forwardRef(
  ({ label, error, type = 'text', className, id, icon: Icon, ...props }, ref) => {
    const { theme } = useUI();
    const isDark = theme === 'dark';

    return (
      <div className="w-full space-y-2 text-left">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-bold tracking-widest uppercase"
            style={{ color: isDark ? 'rgba(148,163,184,0.9)' : 'rgba(51,65,85,0.8)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(99,60,220,0.4)' }}>
              <Icon size={15} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={id}
            className={clsx(
              'w-full py-3 text-sm rounded-xl transition-all duration-200 outline-none font-medium',
              Icon ? 'pl-10 pr-4' : 'px-4',
              error
                ? 'ring-1 ring-red-500/40'
                : 'focus:ring-2',
              className
            )}
            style={{
              background: isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(99,60,220,0.03)',
              border: error
                ? '1px solid rgba(239,68,68,0.5)'
                : isDark
                  ? '1px solid rgba(167,139,250,0.15)'
                  : '1px solid rgba(99,60,220,0.15)',
              color: isDark ? '#f1f5f9' : '#0f172a',
              '--tw-ring-color': error ? 'rgba(239,68,68,0.2)' : 'rgba(109,40,217,0.15)',
            }}
            placeholder={props.placeholder}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
