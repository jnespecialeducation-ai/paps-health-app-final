'use client';

import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useClickFx } from '../click/useClickFx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  children,
  className = '',
  variant = 'primary',
  onClick,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
  }
>) {
  const { handleClick } = useClickFx();

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

  const styles: Record<Variant, string> = {
    primary:
      'text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 shadow-neon hover:brightness-110',
    secondary:
      'text-fg bg-surface-muted border border-border hover:bg-surface hover:border-border/80',
    ghost: 'text-fg hover:bg-surface-muted',
    danger:
      'text-white bg-gradient-to-r from-rose-500 via-red-600 to-orange-500 shadow-[0_10px_30px_-15px_rgba(244,63,94,0.7)] hover:brightness-110',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={[base, styles[variant], className].join(' ')}
      onClick={(e) => handleClick(e, onClick)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

