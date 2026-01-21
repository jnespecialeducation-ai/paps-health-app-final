'use client';

import type { PropsWithChildren } from 'react';

export function Card({
  children,
  className = '',
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl',
        'shadow-[0_10px_35px_-15px_rgba(0,0,0,0.55)]',
        'ring-1 ring-white/10',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

