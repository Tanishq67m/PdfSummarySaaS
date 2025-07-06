'use client';

import { motion, TargetAndTransition, Transition } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
  delay?: number;
}

export function MotionWrapper({ 
  children, 
  className, 
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.6 },
  delay = 0
}: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}