'use client';

import { motion, type MotionProps, useReducedMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

type FadeInProps = PropsWithChildren<
  {
    className?: string;
    delay?: number;
    y?: number;
    once?: boolean;
  } & MotionProps
>;

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
  ...rest
}: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={reduce ? undefined : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

